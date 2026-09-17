<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class FinancialTransactionService
{
    public function create(array $data, int $organizationId, int $userId): FinancialTransaction
    {
        $account = FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($data['financial_account_id']);

        if (!in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
            throw new RuntimeException('Transactions cannot be created for this account status.');
        }

        return DB::transaction(function () use ($data, $account, $organizationId, $userId) {
            $transaction = FinancialTransaction::create([
                'organization_id' => $organizationId,
                'branch_id' => $account->branch_id,
                'financial_account_id' => $account->id,
                'transaction_no' => $this->nextNumber($organizationId),
                'transaction_type' => $data['transaction_type'],
                'transaction_date' => $data['transaction_date'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'BDT',
                'status' => 'PENDING',
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'created_by' => $userId,
            ]);

            $transaction->entries()->create([
                'financial_account_id' => $account->id,
                'direction' => $data['transaction_type'] === 'DEPOSIT' ? 'CREDIT' : 'DEBIT',
                'amount' => $data['amount'],
                'description' => $data['description'] ?? null,
                'line_no' => 1,
            ]);

            return $transaction->load('entries');
        });
    }

    public function post(FinancialTransaction $transaction, int $organizationId, int $userId): FinancialTransaction
    {
        return DB::transaction(function () use ($transaction, $organizationId, $userId) {
            $transaction->load('entries');

            if ($transaction->organization_id !== $organizationId) {
                abort(404);
            }

            if ($transaction->status !== 'PENDING') {
                throw new RuntimeException('Only pending transactions can be posted.');
            }

            $account = FinancialAccount::query()->lockForUpdate()->findOrFail($transaction->financial_account_id);
            $amount = (float) $transaction->amount;
            $newBalance = $transaction->transaction_type === 'DEPOSIT'
                ? (float) $account->balance + $amount
                : (float) $account->balance - $amount;

            if ($newBalance < 0) {
                throw new RuntimeException('The account does not have enough available balance.');
            }

            $account->update([
                'balance' => $newBalance,
                'available_balance' => $newBalance,
            ]);

            $transaction->entries()->first()?->update(['balance_after' => $newBalance]);
            $transaction->update(['status' => 'POSTED', 'posted_by' => $userId, 'posted_at' => now()]);

            return $transaction->fresh(['financialAccount', 'entries']);
        });
    }

    public function reverse(FinancialTransaction $transaction, int $organizationId): FinancialTransaction
    {
        return DB::transaction(function () use ($transaction, $organizationId) {
            if ($transaction->organization_id !== $organizationId) {
                abort(404);
            }

            if ($transaction->status !== 'POSTED') {
                throw new RuntimeException('Only posted transactions can be reversed.');
            }

            $account = FinancialAccount::query()->lockForUpdate()->findOrFail($transaction->financial_account_id);
            $amount = (float) $transaction->amount;
            $newBalance = $transaction->transaction_type === 'DEPOSIT'
                ? (float) $account->balance - $amount
                : (float) $account->balance + $amount;

            if ($newBalance < 0) {
                throw new RuntimeException('The reversal would create a negative balance.');
            }

            $account->update(['balance' => $newBalance, 'available_balance' => $newBalance]);
            $transaction->update(['status' => 'REVERSED']);

            return $transaction->fresh(['financialAccount', 'entries']);
        });
    }

    public function queryForOrganization(int $organizationId): Builder
    {
        return FinancialTransaction::query()->where('organization_id', $organizationId);
    }

    private function nextNumber(int $organizationId): string
    {
        $next = ((int) FinancialTransaction::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return sprintf('FT-%06d', $next);
    }
}