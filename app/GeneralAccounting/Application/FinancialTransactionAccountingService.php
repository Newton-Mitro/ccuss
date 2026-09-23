<?php

namespace App\GeneralAccounting\Application;

use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\Voucher;
use RuntimeException;

class FinancialTransactionAccountingService
{
    public function post(FinancialTransaction $transaction, int $userId): ?Voucher
    {
        if ($transaction->voucher) {
            return $transaction->voucher;
        }

        $account = $transaction->entries()->with('financialAccount.product')->first()?->financialAccount;
        $mapping = $account?->product?->accountMappings()
            ->where('transaction_type', $transaction->transaction_type)
            ->where('status', true)
            ->first();
        if (!$mapping) {
            return null;
        }

        $date = $transaction->transaction_date->toDateString();
        $fiscalPeriod = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $transaction->organization_id))
            ->where('status', 'OPEN')
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->with('fiscalYear')
            ->first();
        if (!$fiscalPeriod || $fiscalPeriod->fiscalYear->status !== 'OPEN') {
            throw new RuntimeException('No open fiscal period covers the financial transaction date.');
        }

        $voucher = Voucher::create([
            'organization_id' => $transaction->organization_id,
            'branch_id' => $transaction->branch_id,
            'fiscal_year_id' => $fiscalPeriod->fiscal_year_id,
            'fiscal_period_id' => $fiscalPeriod->id,
            'financial_transaction_id' => $transaction->id,
            'voucher_no' => 'FT-' . $transaction->transaction_no,
            'voucher_type' => 'SYSTEM',
            'voucher_date' => $date,
            'description' => $transaction->description ?? $transaction->transaction_type,
            'status' => 'POSTED',
            'created_by' => $userId,
            'posted_by' => $userId,
            'posted_at' => now(),
        ]);
        $voucher->entries()->createMany([
            ['account_id' => $mapping->debit_account_id, 'branch_id' => $transaction->branch_id, 'debit' => $transaction->amount, 'credit' => 0, 'reference' => $transaction->transaction_no, 'line_no' => 1],
            ['account_id' => $mapping->credit_account_id, 'branch_id' => $transaction->branch_id, 'debit' => 0, 'credit' => $transaction->amount, 'reference' => $transaction->transaction_no, 'line_no' => 2],
        ]);

        return $voucher->load('entries');
    }

    public function reverse(FinancialTransaction $transaction): void
    {
        $transaction->voucher?->update(['status' => 'REVERSED']);
    }
}
