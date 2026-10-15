<?php

namespace App\GeneralAccounting\Application;

use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanProduct;
use App\GeneralAccounting\Application\TreasurySummaryPostingService;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\GeneralAccounting\Models\Voucher;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\BankAccount;

class FinancialTransactionAccountingService
{
    public function __construct(
        private readonly TreasurySummaryPostingService $postingService,
    ) {
    }

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
            ->map(fn($entry) => $entry->financialAccount?->product?->accountMappings()
                ->where('transaction_type', $transaction->transaction_type)
                ->where('status', true)
                ->first())
            ->filter()
            ->unique(fn($mapping) => $mapping->debit_account_id . ':' . $mapping->credit_account_id)
            ->values();

        $debitTotal = (float) $entries->where('direction', 'DEBIT')->sum('amount');
        $creditTotal = (float) $entries->where('direction', 'CREDIT')->sum('amount');
        $amount = max($debitTotal, $creditTotal);
        if ($amount <= 0) {
            $amount = (float) $transaction->amount;
        }

        $source = $this->resolveSource($transaction, $entries);
        $mapping = $productMappings->count() === 1 ? $productMappings->first() : null;
        $mappingProduct = $mapping?->product;
        $productSourceType = $mappingProduct instanceof LoanProduct ? 'LOAN_PRODUCT' : 'DEPOSIT_PRODUCT';
        $debitAccountOverride = $mapping?->debit_account_id;
        $creditAccountOverride = $mapping?->credit_account_id;

        if (
            $mapping
            && $source
            && $source['type'] === 'CASH_LOCATION'
            && in_array($transaction->transaction_type, ['DEPOSIT', 'WITHDRAWAL'], true)
        ) {
            $cashMapping = TreasuryGlMapping::query()
                ->where('organization_id', $transaction->organization_id)
                ->where('source_type', 'CASH_LOCATION')
                ->where('source_code', $source['code'])
                ->where('transaction_type', $transaction->transaction_type)
                ->where('status', true)
                ->first();

            if (!$cashMapping) {
                throw new \RuntimeException(
                    'An active Cash On Hand control mapping is required for teller deposits and withdrawals.',
                );
            }

            $cashControlAccountId = $transaction->transaction_type === 'DEPOSIT'
                ? $cashMapping->debit_account_id
                : $cashMapping->credit_account_id;
            $isCashControlAccount = LedgerAccount::query()
                ->where('organization_id', $transaction->organization_id)
                ->where('status', true)
                ->where('is_cash_account', true)
                ->where('is_control_account', true)
                ->whereKey($cashControlAccountId)
                ->exists();

            if (!$isCashControlAccount) {
                throw new \RuntimeException(
                    'The cash side of the teller mapping must be an active cash control account.',
                );
            }

            if ($transaction->transaction_type === 'DEPOSIT') {
                $debitAccountOverride = $cashControlAccountId;
            } else {
                $creditAccountOverride = $cashControlAccountId;
            }
        }

        if (!$mapping && !$source) {
            return null;
        }

        return $this->postingService->post(
            organizationId: $transaction->organization_id,
            sourceType: $mapping ? $productSourceType : $source['type'],
            sourceCode: $mapping ? (string) $mappingProduct->id : $source['code'],
            transactionType: $transaction->transaction_type,
            voucherNo: 'FT-' . $transaction->transaction_no,
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
        $cashLocationTypes = CashLocation::query()
            ->where('organization_id', $transaction->organization_id)
            ->whereIn('financial_account_id', $accountIds)
            ->where('is_active', true)
            ->distinct()
            ->pluck('type');

        if ($cashLocationTypes->count() === 1) {
            return ['type' => 'CASH_LOCATION', 'code' => $cashLocationTypes->first()];
        }

        if ($cashLocationTypes->count() > 1) {
            return ['type' => 'CASH_LOCATION', 'code' => 'MIXED'];
        }

        $bankCodes = BankAccount::query()
            ->where('organization_id', $transaction->organization_id)
            ->whereIn('financial_account_id', $accountIds)
            ->with('bank:id,code')
            ->get()
            ->map(fn($account) => $account->bank?->code)
            ->filter()
            ->unique();

        if ($bankCodes->count() === 1) {
            return ['type' => 'BANK_ACCOUNT', 'code' => $bankCodes->first()];
        }

        return $bankCodes->count() > 1
            ? ['type' => 'BANK_ACCOUNT', 'code' => 'MIXED']
            : null;
    }

    public function reverse(FinancialTransaction $transaction): void
    {
        $transaction->voucher?->update(['status' => 'REVERSED']);
    }
}
