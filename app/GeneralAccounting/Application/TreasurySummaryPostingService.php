<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\GeneralAccounting\Models\Voucher;
use RuntimeException;

class TreasurySummaryPostingService
{
    public function post(
        int $organizationId,
        string $sourceType,
        string $sourceCode,
        string $transactionType,
        string $voucherNo,
        string $voucherDate,
        ?int $branchId,
        int $userId,
        float $amount,
        string $description,
        string $reference,
        ?int $financialTransactionId = null,
        ?int $debitAccountOverride = null,
        ?int $creditAccountOverride = null,
    ): Voucher {
        if ($financialTransactionId) {
            $existing = Voucher::query()
                ->where('organization_id', $organizationId)
                ->where('financial_transaction_id', $financialTransactionId)
                ->first();
            if ($existing) {
                return $existing->load('entries');
            }
        }

        $existing = Voucher::query()
            ->where('organization_id', $organizationId)
            ->where('voucher_no', $voucherNo)
            ->first();
        if ($existing) {
            return $existing->load('entries');
        }

        $mapping = TreasuryGlMapping::query()
            ->where('organization_id', $organizationId)
            ->where('source_type', $sourceType)
            ->where('source_code', $sourceCode)
            ->where('transaction_type', $transactionType)
            ->where('status', true)
            ->first();

        $debitAccountId = $debitAccountOverride ?? $mapping?->debit_account_id;
        $creditAccountId = $creditAccountOverride ?? $mapping?->credit_account_id;

        if (! $debitAccountId || ! $creditAccountId) {
            throw new RuntimeException(
                "No active General Ledger mapping exists for {$sourceType}/{$sourceCode}/{$transactionType}.",
            );
        }

        if ($amount <= 0 || $debitAccountId === $creditAccountId) {
            throw new RuntimeException('Treasury summary posting requires a positive amount and two different ledger accounts.');
        }

        $accounts = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->whereIn('id', [$debitAccountId, $creditAccountId])
            ->get()
            ->keyBy('id');

        if ($accounts->count() !== 2) {
            throw new RuntimeException('Treasury GL mappings must reference active ledger accounts in the active organization.');
        }

        if ($sourceType === 'CASH_LOCATION' && in_array($transactionType, ['DEPOSIT', 'WITHDRAWAL'], true)) {
            $cashAccount = $accounts->get($transactionType === 'DEPOSIT' ? $debitAccountId : $creditAccountId);
            if (! $cashAccount->is_cash_account || ! $cashAccount->is_control_account) {
                throw new RuntimeException(
                    'The cash side of a cash location mapping must be an active cash control account.',
                );
            }
        }

        $fiscalPeriod = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $organizationId)->where('status', 'OPEN'))
            ->where('status', 'OPEN')
            ->whereDate('start_date', '<=', $voucherDate)
            ->whereDate('end_date', '>=', $voucherDate)
            ->with('fiscalYear')
            ->first();

        if (! $fiscalPeriod) {
            throw new RuntimeException('No open fiscal period covers the Treasury transaction date.');
        }

        $voucher = Voucher::query()->create([
            'organization_id' => $organizationId,
            'branch_id' => $branchId,
            'fiscal_year_id' => $fiscalPeriod->fiscal_year_id,
            'fiscal_period_id' => $fiscalPeriod->id,
            'financial_transaction_id' => $financialTransactionId,
            'voucher_no' => $voucherNo,
            'voucher_type' => 'SYSTEM',
            'voucher_date' => $voucherDate,
            'description' => $description,
            'status' => 'POSTED',
            'created_by' => $userId,
            'posted_by' => $userId,
            'posted_at' => now(),
        ]);

        $voucher->entries()->createMany([
            [
                'account_id' => $debitAccountId,
                'branch_id' => $branchId,
                'debit' => $amount,
                'credit' => 0,
                'reference' => $reference,
                'line_no' => 1,
            ],
            [
                'account_id' => $creditAccountId,
                'branch_id' => $branchId,
                'debit' => 0,
                'credit' => $amount,
                'reference' => $reference,
                'line_no' => 2,
            ],
        ]);

        return $voucher->load('entries');
    }

    public function postJournal(
        int $organizationId,
        string $voucherNo,
        string $voucherDate,
        ?int $branchId,
        int $userId,
        string $description,
        string $reference,
        int $financialTransactionId,
        array $lines,
    ): Voucher {
        $existing = Voucher::query()
            ->where('organization_id', $organizationId)
            ->where('financial_transaction_id', $financialTransactionId)
            ->first();
        if ($existing) {
            return $existing->load('entries');
        }

        $existing = Voucher::query()
            ->where('organization_id', $organizationId)
            ->where('voucher_no', $voucherNo)
            ->first();
        if ($existing) {
            return $existing->load('entries');
        }

        $debitTotal = collect($lines)
            ->where('direction', 'DEBIT')
            ->sum(fn (array $line): float => (float) $line['amount']);
        $creditTotal = collect($lines)
            ->where('direction', 'CREDIT')
            ->sum(fn (array $line): float => (float) $line['amount']);

        if (
            $lines === []
            || $debitTotal <= 0
            || abs($debitTotal - $creditTotal) > 0.0001
            || collect($lines)->contains(fn (array $line): bool => (float) $line['amount'] <= 0)
        ) {
            throw new RuntimeException('General Ledger journal lines must have positive amounts and equal debit and credit totals.');
        }

        $accountIds = collect($lines)->pluck('account_id')->unique();
        $accounts = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->whereIn('id', $accountIds)
            ->get()
            ->keyBy('id');

        if ($accounts->count() !== $accountIds->count()) {
            throw new RuntimeException('Every General Ledger journal line must reference an active account in the active organization.');
        }

        $fiscalPeriod = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $organizationId)->where('status', 'OPEN'))
            ->where('status', 'OPEN')
            ->whereDate('start_date', '<=', $voucherDate)
            ->whereDate('end_date', '>=', $voucherDate)
            ->with('fiscalYear')
            ->first();

        if (! $fiscalPeriod) {
            throw new RuntimeException('No open fiscal period covers the Treasury transaction date.');
        }

        $voucher = Voucher::query()->create([
            'organization_id' => $organizationId,
            'branch_id' => $branchId,
            'fiscal_year_id' => $fiscalPeriod->fiscal_year_id,
            'fiscal_period_id' => $fiscalPeriod->id,
            'financial_transaction_id' => $financialTransactionId,
            'voucher_no' => $voucherNo,
            'voucher_type' => 'SYSTEM',
            'voucher_date' => $voucherDate,
            'description' => $description,
            'status' => 'POSTED',
            'created_by' => $userId,
            'posted_by' => $userId,
            'posted_at' => now(),
        ]);

        $voucher->entries()->createMany(collect($lines)->values()->map(
            fn (array $line, int $index): array => [
                'account_id' => $line['account_id'],
                'branch_id' => $branchId,
                'debit' => $line['direction'] === 'DEBIT' ? $line['amount'] : 0,
                'credit' => $line['direction'] === 'CREDIT' ? $line['amount'] : 0,
                'reference' => $reference,
                'description' => $line['description'] ?? $description,
                'line_no' => $index + 1,
            ],
        )->all());

        return $voucher->load('entries');
    }
}
