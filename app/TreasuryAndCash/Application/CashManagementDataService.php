<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\Vault;
use Illuminate\Pagination\LengthAwarePaginator;

class CashManagementDataService
{
    public function listVaults(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = Vault::query()
            ->whereHas('cashLocation', fn($location) => $location->where('organization_id', $organizationId))
            ->with('cashLocation.branch')
            ->latest();

        $this->applySearch($query, $search);

        return $query->paginate($perPage)->withQueryString();
    }

    public function listTellers(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = Teller::query()
            ->whereHas('cashLocation', fn($location) => $location->where('organization_id', $organizationId))
            ->with(['cashLocation.branch', 'user'])
            ->latest();

        $this->applySearch($query, $search);

        return $query->paginate($perPage)->withQueryString();
    }

    public function listTellerSessions(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = TellerSession::query()
            ->whereHas('branchDay', fn($branchDay) => $branchDay->where('organization_id', $organizationId))
            ->with(['branchDay.branch', 'teller', 'openedBy', 'closedBy'])
            ->latest();

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('status', 'like', "%{$searchTerm}%")
                    ->orWhereHas('teller', function ($tellerQuery) use ($searchTerm) {
                        $tellerQuery->where('code', 'like', "%{$searchTerm}%")
                            ->orWhere('name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('branchDay', function ($branchDayQuery) use ($searchTerm) {
                        $branchDayQuery->where('business_date', 'like', "%{$searchTerm}%")
                            ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                                $branchQuery->where('name', 'like', "%{$searchTerm}%")
                                    ->orWhere('code', 'like', "%{$searchTerm}%");
                            });
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function tellerSessionOptions(int $organizationId, int $branchId): array
    {
        return [
            'branch_day' => \App\TreasuryAndCash\Models\BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', \App\TreasuryAndCash\Models\BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->first(['id', 'business_date']),
            'tellers' => Teller::query()
                ->where('status', 'ACTIVE')
                ->whereHas('cashLocation', function ($query) use ($organizationId, $branchId) {
                    $query->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('is_active', true);
                })
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
        ];
    }

    private function applySearch($query, ?string $search): void
    {
        if (empty($search)) {
            return;
        }

        $searchTerm = trim($search);
        $query->where(function ($builder) use ($searchTerm) {
            $builder->where('code', 'like', "%{$searchTerm}%")
                ->orWhere('name', 'like', "%{$searchTerm}%")
                ->orWhereHas('cashLocation', function ($locationQuery) use ($searchTerm) {
                    $locationQuery->where('code', 'like', "%{$searchTerm}%")
                        ->orWhere('name', 'like', "%{$searchTerm}%")
                        ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                            $branchQuery->where('name', 'like', "%{$searchTerm}%")
                                ->orWhere('code', 'like', "%{$searchTerm}%");
                        });
                });
        });
    }
}
