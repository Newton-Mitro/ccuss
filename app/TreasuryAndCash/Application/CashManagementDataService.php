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
