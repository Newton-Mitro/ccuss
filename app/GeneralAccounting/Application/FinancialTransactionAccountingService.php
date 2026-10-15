<?php

namespace App\GeneralAccounting\Application;

use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanProduct;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\GeneralAccounting\Models\Voucher;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\CashLocation;

class FinancialTransactionAccountingService
{
    public function __construct(
        private readonly TreasurySummaryPostingService $postingService,
    ) {}

    public function post(FinancialTransaction $transaction, int $userId): ?Voucher
    {
        if ($transaction->voucher) {
            return $transaction->voucher;
        }

        $entries = $transaction->entries()->with('financialAccount.product')->orderBy('line_no')->get();
        if ($entries->isEmpty()) {
            return null;
        }

        $productMappings = $entries
            ->map(fn ($entry) => $entry->financialAccount?->product?->accountMappings()
                ->where('transaction_type', $transaction->transaction_type)
                ->where('status', true)
                ->first())
            ->filter()
            ->unique(fn ($mapping) => $mapping->debit_account_id.':'.$mapping->credit_account_id)
            ->values();

        $debitTotal = (float) $entries->where('direction', 'DEBIT')->sum('amount');
        $creditTotal = (float) $entries->where('direction', 'CREDIT')->sum('amount');
        $amount = max($debitTotal, $creditTotal);
        if ($amount <= 0) {
            $amount = (float) $transaction->amount;
        }

        $source = $this->resolveSource($transaction, $entries);
        if (
            $source
            && in_array($source['type'], ['CASH_LOCATION', 'BANK_ACCOUNT'], true)
            && in_array($transaction->transaction_type, ['DEPOSIT', 'WITHDRAWAL'], true)
        ) {
            return $this->postDirectAccountTransaction($transaction, $userId, $entries, $source);
        }

        $mapping = $productMappings->count() === 1 ? $productMappings->first() : null;
        $mappingProduct = $mapping?->product;
        $productSourceType = $mappingProduct instanceof LoanProduct ? 'LOAN_PRODUCT' : 'DEPOSIT_PRODUCT';
        $debitAccountOverride = $mapping?->debit_account_id;
        $creditAccountOverride = $mapping?->credit_account_id;

        if ($mapping && $source && in_array($source['type'], ['CASH_LOCATION', 'BANK_ACCOUNT'], true)) {
            $treasuryMapping = TreasuryGlMapping::query()
                ->where('organization_id', $transaction->organization_id)
                ->where('source_type', $source['type'])
                ->where('source_code', $source['code'])
                ->where('transaction_type', $transaction->transaction_type)
                ->where('status', true)
                ->with(['debitAccount', 'creditAccount'])
                ->first();

            if (
                ! $treasuryMapping
                && $source['type'] === 'CASH_LOCATION'
                && in_array($transaction->transaction_type, ['DEPOSIT', 'WITHDRAWAL'], true)
            ) {
                throw new \RuntimeException(
                    "An active cash control mapping is required for {$source['code']} {$transaction->transaction_type} postings.",
                );
            }

            $cashControlSide = match ($source['type'].'/'.$transaction->transaction_type) {
                'CASH_LOCATION/DEPOSIT',
                'CASH_LOCATION/LOAN_REPAYMENT',
                'CASH_LOCATION/FINE_PAYMENT',
                'BANK_ACCOUNT/DEPOSIT',
                'BANK_ACCOUNT/TRANSFER_IN',
                'BANK_ACCOUNT/INTEREST',
                'BANK_ACCOUNT/LOAN_REPAYMENT',
                'BANK_ACCOUNT/FINE_PAYMENT' => 'debit',
                'CASH_LOCATION/WITHDRAWAL',
                'CASH_LOCATION/LOAN_DISBURSEMENT',
                'BANK_ACCOUNT/WITHDRAWAL',
                'BANK_ACCOUNT/TRANSFER_OUT',
                'BANK_ACCOUNT/CHARGE',
                'BANK_ACCOUNT/ADJUSTMENT',
                'BANK_ACCOUNT/LOAN_DISBURSEMENT' => 'credit',
                default => null,
            };
            $cashControlAccount = $treasuryMapping
                ? ($cashControlSide === 'debit'
                    ? $treasuryMapping->debitAccount
                    : ($cashControlSide === 'credit' ? $treasuryMapping->creditAccount : null))
                : null;

            if (
                $treasuryMapping
                && (! $cashControlAccount
                    || ! $cashControlAccount->status
                    || ! $cashControlAccount->is_cash_account
                    || ! $cashControlAccount->is_control_account)
            ) {
                throw new \RuntimeException(
                    'Treasury mappings must identify an active cash control account.',
                );
            }

            if ($cashControlAccount) {
                if ($cashControlSide === 'debit') {
                    $debitAccountOverride = $cashControlAccount->id;
                } else {
                    $creditAccountOverride = $cashControlAccount->id;
                }
            }
        }

        if (! $mapping && ! $source) {
            return null;
        }

        if (
            ! $mapping
            && $source
            && $source['type'] === 'CASH_LOCATION'
            && in_array($transaction->transaction_type, ['DEPOSIT', 'WITHDRAWAL'], true)
        ) {
            throw new \RuntimeException(
                'A financial product account mapping is required to post a cash-location deposit or withdrawal without a clearing account.',
            );
        }

        return $this->postingService->post(
            organizationId: $transaction->organization_id,
            sourceType: $mapping ? $productSourceType : $source['type'],
            sourceCode: $mapping ? (string) $mappingProduct->id : $source['code'],
            transactionType: $transaction->transaction_type,
            voucherNo: 'FT-'.$transaction->transaction_no,
            voucherDate: $transaction->transaction_date->toDateString(),
            branchId: $transaction->branch_id,
            userId: $userId,
            amount: $amount,
            description: $transaction->description ?? $transaction->transaction_type,
            reference: $transaction->transaction_no,
            financialTransactionId: $transaction->id,
            debitAccountOverride: $debitAccountOverride,
            creditAccountOverride: $creditAccountOverride,
        );
    }

    private function resolveSource(FinancialTransaction $transaction, $entries): ?array
    {
        $accountIds = $entries->pluck('financial_account_id')->unique()->values();
        $cashLocations = CashLocation::query()
            ->where('organization_id', $transaction->organization_id)
            ->whereIn('financial_account_id', $accountIds)
            ->where('is_active', true)
            ->get(['type', 'financial_account_id']);
        $cashLocationTypes = $cashLocations->pluck('type')->unique()->values();

        if ($cashLocationTypes->count() === 1) {
            return [
                'type' => 'CASH_LOCATION',
                'code' => $cashLocationTypes->first(),
                'financial_account_ids' => $cashLocations->pluck('financial_account_id')->unique()->all(),
            ];
        }

        if ($cashLocationTypes->count() > 1) {
            return [
                'type' => 'CASH_LOCATION',
                'code' => 'MIXED',
                'financial_account_ids' => $cashLocations->pluck('financial_account_id')->unique()->all(),
            ];
        }

        $bankAccounts = BankAccount::query()
            ->where('organization_id', $transaction->organization_id)
            ->whereIn('financial_account_id', $accountIds)
            ->get(['financial_account_id']);

        if ($bankAccounts->isNotEmpty()) {
            return [
                'type' => 'BANK_ACCOUNT',
                'code' => 'DEFAULT',
                'financial_account_ids' => $bankAccounts->pluck('financial_account_id')->unique()->all(),
            ];
        }

        return null;
    }

    private function postDirectAccountTransaction(
        FinancialTransaction $transaction,
        int $userId,
        $entries,
        array $source,
    ): Voucher {
        $cashControlSide = $transaction->transaction_type === 'DEPOSIT' ? 'debit' : 'credit';
        $treasuryMapping = TreasuryGlMapping::query()
            ->where('organization_id', $transaction->organization_id)
            ->where('source_type', $source['type'])
            ->where('source_code', $source['code'])
            ->where('transaction_type', $transaction->transaction_type)
            ->where('status', true)
            ->with(['debitAccount', 'creditAccount'])
            ->first();

        $cashControlAccount = $treasuryMapping
            ? ($cashControlSide === 'debit'
                ? $treasuryMapping->debitAccount
                : $treasuryMapping->creditAccount)
            : null;

        if (
            ! $cashControlAccount
            || ! $cashControlAccount->status
            || ! $cashControlAccount->is_cash_account
            || ! $cashControlAccount->is_control_account
        ) {
            throw new \RuntimeException(
                "An active cash control mapping is required for {$source['code']} {$transaction->transaction_type} postings.",
            );
        }

        $counterpartDirection = $transaction->transaction_type === 'DEPOSIT' ? 'CREDIT' : 'DEBIT';
        $sourceAccountIds = $source['financial_account_ids'];
        $counterpartLines = [];
        $amount = 0.0;

        foreach ($entries as $entry) {
            if (in_array($entry->financial_account_id, $sourceAccountIds, true)) {
                continue;
            }

            $entryAmount = (float) $entry->amount;
            if ($entryAmount <= 0) {
                continue;
            }

            $productMapping = $entry->financialAccount?->product?->accountMappings()
                ->where('transaction_type', $transaction->transaction_type)
                ->where('status', true)
                ->first();

            if ($productMapping) {
                $counterpartAccountId = $cashControlSide === 'debit'
                    ? $productMapping->credit_account_id
                    : $productMapping->debit_account_id;
            } else {
                $accountCode = match ($entry->financialAccount?->account_type) {
                    'SAVINGS' => '2100',
                    'FIXED_DEPOSIT' => '2200',
                    'RECURRING_DEPOSIT' => '2300',
                    'SHARE' => '3100',
                    default => null,
                };

                if (! $accountCode) {
                    throw new \RuntimeException(
                        'A financial product account mapping is required for this account type to post without a clearing account.',
                    );
                }

                $counterpartAccountId = LedgerAccount::query()
                    ->where('organization_id', $transaction->organization_id)
                    ->where('code', $accountCode)
                    ->where('status', true)
                    ->value('id');
            }

            if (! $counterpartAccountId) {
                throw new \RuntimeException('The transaction counterpart ledger account could not be resolved.');
            }

            $counterpartLines[] = [
                'account_id' => $counterpartAccountId,
                'direction' => $counterpartDirection,
                'amount' => $entryAmount,
            ];
            $amount += $entryAmount;
        }

        if ($amount <= 0) {
            throw new \RuntimeException('The transaction has no financial account entries to post.');
        }

        return $this->postingService->postJournal(
            organizationId: $transaction->organization_id,
            voucherNo: 'FT-'.$transaction->transaction_no,
            voucherDate: $transaction->transaction_date->toDateString(),
            branchId: $transaction->branch_id,
            userId: $userId,
            description: $transaction->description ?? $transaction->transaction_type,
            reference: $transaction->transaction_no,
            financialTransactionId: $transaction->id,
            lines: [
                [
                    'account_id' => $cashControlAccount->id,
                    'direction' => $cashControlSide === 'debit' ? 'DEBIT' : 'CREDIT',
                    'amount' => $amount,
                ],
                ...$counterpartLines,
            ],
        );
    }

    public function reverse(FinancialTransaction $transaction): void
    {
        $transaction->voucher?->update(['status' => 'REVERSED']);
    }
}
