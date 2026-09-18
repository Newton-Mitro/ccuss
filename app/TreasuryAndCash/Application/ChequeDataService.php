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
            ->whereHas('bankAccount', fn($account) => $account->where('organization_id', $organizationId))
            ->with('bankAccount.bank', 'bankAccount.branch')
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('book_no', 'like', "%{$searchTerm}%")
                    ->orWhere('prefix', 'like', "%{$searchTerm}%")
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
            ->whereHas('chequeBook.bankAccount', fn($account) => $account->where('organization_id', $organizationId))
            ->with('chequeBook.bankAccount.bank')
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
