<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BankAccount;
use Illuminate\Pagination\LengthAwarePaginator;

use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankTransaction;

class BankingDataService
{
    public function listTransactions(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = BankTransaction::query()
            ->whereHas('bankAccount', fn($account) => $account->where('organization_id', $organizationId))
            ->with(['bankAccount.bank', 'branchDay'])
            ->latest('transaction_date');

        if (!empty($search)) {
            $term = trim($search);
            $query->where(function ($builder) use ($term) {
                $builder->where('transaction_no', 'like', "%{$term}%")
                    ->orWhere('type', 'like', "%{$term}%")
                    ->orWhere('status', 'like', "%{$term}%")
                    ->orWhere('reference', 'like', "%{$term}%")
                    ->orWhereHas('bankAccount', fn($account) => $account
                        ->where('account_name', 'like', "%{$term}%")
                        ->orWhere('account_number', 'like', "%{$term}%"));
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }
    public function listBanks(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = Bank::query()
            ->where('organization_id', $organizationId)
            ->withCount('accounts')
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('code', 'like', "%{$searchTerm}%")
                    ->orWhere('short_name', 'like', "%{$searchTerm}%");
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listAccounts(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = BankAccount::query()
            ->where('organization_id', $organizationId)
            ->with(['bank', 'branch', 'financialAccount'])
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('account_name', 'like', "%{$searchTerm}%")
                    ->orWhere('account_number', 'like', "%{$searchTerm}%")
                    ->orWhereHas('bank', function ($bankQuery) use ($searchTerm) {
                        $bankQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('code', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                        $branchQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('code', 'like', "%{$searchTerm}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
