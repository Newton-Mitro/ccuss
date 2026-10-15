<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankTransaction;
use Illuminate\Pagination\LengthAwarePaginator;

class BankingDataService
{
    public function listTransactions(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = BankTransaction::query()
            ->whereHas('bankAccount', fn ($account) => $account->where('organization_id', $organizationId))
            ->with(['bankAccount', 'branchDay', 'counterpartAccount:id,code,name'])
            ->latest('transaction_date');

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($builder) use ($term) {
                $builder->where('transaction_no', 'like', "%{$term}%")
                    ->orWhere('type', 'like', "%{$term}%")
                    ->orWhere('status', 'like', "%{$term}%")
                    ->orWhere('reference', 'like', "%{$term}%")
                    ->orWhereHas('bankAccount', fn ($account) => $account
                        ->where('account_name', 'like', "%{$term}%")
                        ->orWhere('account_number', 'like', "%{$term}%"));
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listAccounts(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $postedTransactionNet = BankTransaction::query()
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type IN (?, ?, ?) THEN amount ELSE -amount END), 0)',
                ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'],
            )
            ->whereColumn('bank_account_id', 'bank_accounts.id')
            ->where('status', 'POSTED');

        $query = BankAccount::query()
            ->select('bank_accounts.*')
            ->selectRaw(
                '(bank_accounts.opening_balance + ('.$postedTransactionNet->toSql().')) as balance',
                $postedTransactionNet->getBindings(),
            )
            ->where('organization_id', $organizationId)
            ->with('branch')
            ->latest();

        if (! empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('account_name', 'like', "%{$searchTerm}%")
                    ->orWhere('account_number', 'like', "%{$searchTerm}%")
                    ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                        $branchQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('code', 'like', "%{$searchTerm}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function findAccount(int $organizationId, int $accountId): ?BankAccount
    {
        $postedTransactionNet = BankTransaction::query()
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type IN (?, ?, ?) THEN amount ELSE -amount END), 0)',
                ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'],
            )
            ->whereColumn('bank_account_id', 'bank_accounts.id')
            ->where('status', 'POSTED');

        return BankAccount::query()
            ->select('bank_accounts.*')
            ->selectRaw(
                '(bank_accounts.opening_balance + ('.$postedTransactionNet->toSql().')) as balance',
                $postedTransactionNet->getBindings(),
            )
            ->where('organization_id', $organizationId)
            ->with(['branch', 'financialAccount:id,account_no,name'])
            ->find($accountId);
    }
}
