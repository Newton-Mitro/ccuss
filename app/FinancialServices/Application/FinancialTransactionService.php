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

    public function createMultiLine(
        array $data,
        array $entries,
        int $organizationId,
        int $userId,
        ?int $branchId = null,
    ): FinancialTransaction {
        return DB::transaction(function () use ($data, $entries, $organizationId, $userId, $branchId) {
            $accountIds = collect($entries)->pluck('financial_account_id')->unique()->values();
            $accounts = FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('id', $accountIds)
                ->get()
                ->keyBy('id');

            if ($accounts->count() !== $accountIds->count()) {
                throw new RuntimeException('All transaction accounts must belong to the active organization.');
            }

            foreach ($accounts as $account) {
                if (!in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
                    throw new RuntimeException('Transactions cannot be created for this account status.');
                }
            }

            $total = collect($entries)->sum(fn(array $entry): float => (float) $entry['amount']);
            $debitTotal = collect($entries)
                ->where('direction', 'DEBIT')
                ->sum(fn(array $entry): float => (float) $entry['amount']);
            $creditTotal = collect($entries)
                ->where('direction', 'CREDIT')
                ->sum(fn(array $entry): float => (float) $entry['amount']);

            if ($total <= 0 || abs($debitTotal - $creditTotal) > 0.0001) {
                throw new RuntimeException('Financial transaction entries must be balanced and greater than zero.');
            }

            $transaction = FinancialTransaction::create([
                'organization_id' => $organizationId,
                'branch_id' => $branchId,
                'transaction_no' => $this->nextNumber($organizationId),
                'transaction_type' => $data['transaction_type'],
                'transaction_date' => $data['transaction_date'],
                'amount' => $total,
                'currency' => $data['currency'] ?? 'BDT',
                'status' => 'PENDING',
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'created_by' => $userId,
            ]);

            $transaction->entries()->createMany(
                collect($entries)->values()->map(fn(array $entry, int $index): array => [
                    'financial_account_id' => $entry['financial_account_id'],
                    'direction' => $entry['direction'],
                    'amount' => $entry['amount'],
                    'description' => $entry['description'] ?? null,
                    'line_no' => $index + 1,
                ])->all(),
            );

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

            foreach ($transaction->entries->sortBy('line_no') as $entry) {
                $account = FinancialAccount::query()
                    ->with('product')
                    ->lockForUpdate()
                    ->findOrFail($entry->financial_account_id);
                $newBalance = $this->balanceAfterEntry($account, $entry->direction, (float) $entry->amount);
                if ($newBalance < 0) {
                    throw new RuntimeException('The account does not have enough available balance.');
                }

                $account->update([
                    'balance' => $newBalance,
                    'available_balance' => $newBalance,
                ]);
                $entry->update(['balance_after' => $newBalance]);
            }
            $transaction->update(['status' => 'POSTED', 'posted_by' => $userId, 'posted_at' => now()]);

            return $transaction->fresh(['entries.financialAccount']);
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

            $transaction->load('entries');
            foreach ($transaction->entries->sortBy('line_no') as $entry) {
                $account = FinancialAccount::query()
                    ->with('product')
                    ->lockForUpdate()
                    ->findOrFail($entry->financial_account_id);
                $oppositeDirection = $entry->direction === 'DEBIT' ? 'CREDIT' : 'DEBIT';
                $newBalance = $this->balanceAfterEntry($account, $oppositeDirection, (float) $entry->amount);
                if ($newBalance < 0) {
                    throw new RuntimeException('The reversal would create a negative balance.');
                }

                $account->update(['balance' => $newBalance, 'available_balance' => $newBalance]);
            }
            $transaction->update(['status' => 'REVERSED']);

            return $transaction->fresh(['entries.financialAccount']);
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

    private function balanceAfterEntry(FinancialAccount $account, string $direction, float $amount): float
    {
        $isAsset = in_array($account->account_type, ['CASH', 'BANK'], true)
            || $account->product?->balance_type === 'ASSET';
        $increases = $isAsset ? $direction === 'DEBIT' : $direction === 'CREDIT';

        return (float) $account->balance + ($increases ? $amount : -$amount);
    }
}