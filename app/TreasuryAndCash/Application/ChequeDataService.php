<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use Illuminate\Pagination\LengthAwarePaginator;

class ChequeDataService
{
    public function listBooks(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = ChequeBook::query()
            ->where(function ($builder) use ($organizationId) {
                $builder->whereHas('financialAccount', fn($account) => $account->where('organization_id', $organizationId))
                    ->orWhereHas('bankAccount.financialAccount', fn($account) => $account->where('organization_id', $organizationId));
            })
            ->with('financialAccount.product', 'financialAccount.holder', 'bankAccount.bank', 'bankAccount.branch')
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('book_no', 'like', "%{$searchTerm}%")
                    ->orWhere('prefix', 'like', "%{$searchTerm}%")
                    ->orWhereHas('financialAccount', function ($accountQuery) use ($searchTerm) {
                        $accountQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('account_no', 'like', "%{$searchTerm}%")
                            ->orWhereHas('holder', function ($holderQuery) use ($searchTerm) {
                                $holderQuery->where('name', 'like', "%{$searchTerm}%")
                                    ->orWhere('customer_no', 'like', "%{$searchTerm}%");
                            });
                    })
                    ->orWhereHas('bankAccount', function ($accountQuery) use ($searchTerm) {
                        $accountQuery->where('account_name', 'like', "%{$searchTerm}%")
                            ->orWhere('account_number', 'like', "%{$searchTerm}%")
                            ->orWhereHas('bank', function ($bankQuery) use ($searchTerm) {
                                $bankQuery->where('name', 'like', "%{$searchTerm}%");
                            });
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listCheques(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = Cheque::query()
            ->where(function ($builder) use ($organizationId) {
                $builder->whereHas('chequeBook.financialAccount', fn($account) => $account->where('organization_id', $organizationId))
                    ->orWhereHas('chequeBook.bankAccount.financialAccount', fn($account) => $account->where('organization_id', $organizationId));
            })
            ->with('chequeBook.financialAccount', 'chequeBook.bankAccount.bank')
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('cheque_no', 'like', "%{$searchTerm}%")
                    ->orWhere('status', 'like', "%{$searchTerm}%")
                    ->orWhere('payee', 'like', "%{$searchTerm}%")
                    ->orWhereHas('chequeBook', function ($bookQuery) use ($searchTerm) {
                        $bookQuery->where('book_no', 'like', "%{$searchTerm}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
