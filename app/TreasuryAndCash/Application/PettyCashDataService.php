<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\PettyCashTransaction;
use App\TreasuryAndCash\Models\BranchDay;
use Illuminate\Pagination\LengthAwarePaginator;

class PettyCashDataService
{
    public function listTransactions(int $organizationId, int $branchId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = PettyCashTransaction::query()
            ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->with(['pettyCashFund', 'branchDay'])
            ->latest('created_at');

        if (!empty($search)) {
            $term = trim($search);
            $query->where(function ($builder) use ($term) {
                $builder->where('transaction_no', 'like', "%{$term}%")
                    ->orWhere('type', 'like', "%{$term}%")
                    ->orWhere('status', 'like', "%{$term}%")
                    ->orWhere('payee', 'like', "%{$term}%")
                    ->orWhereHas('pettyCashFund', function ($fund) use ($term) {
                        $fund->where('name', 'like', "%{$term}%")
                            ->orWhere('code', 'like', "%{$term}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listFunds(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = PettyCashFund::query()
            ->whereHas('cashLocation', fn($location) => $location->where('organization_id', $organizationId))
            ->with(['cashLocation.branch', 'custodian'])
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('code', 'like', "%{$searchTerm}%")
                    ->orWhere('name', 'like', "%{$searchTerm}%")
                    ->orWhereHas('cashLocation', function ($locationQuery) use ($searchTerm) {
                        $locationQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                                $branchQuery->where('name', 'like', "%{$searchTerm}%")
                                    ->orWhere('code', 'like', "%{$searchTerm}%");
                            });
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listAdvanceAccounts(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $paginator = $this->listFunds($organizationId, $search, $perPage);

        $paginator->setCollection($paginator->getCollection()->map(function (PettyCashFund $fund) {
            return [
                'id' => $fund->id,
                'code' => $fund->code,
                'name' => $fund->name,
                'fund_limit' => $fund->fund_limit,
                'current_balance' => $fund->current_balance,
                'method' => $fund->method,
                'status' => $fund->status,
                'custodian_name' => $fund->custodian?->name,
                'branch_name' => $fund->cashLocation?->branch?->name,
            ];
        }));

        return $paginator;
    }

    public function forTransaction(int $organizationId, int $branchId): array
    {
        return [
            'branch_day' => BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->first(),
            'funds' => PettyCashFund::query()
                ->where('status', 'ACTIVE')
                ->whereHas('cashLocation', function ($location) use ($organizationId, $branchId) {
                    $location
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('is_active', true);
                })
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'current_balance', 'fund_limit']),
        ];
    }
}
