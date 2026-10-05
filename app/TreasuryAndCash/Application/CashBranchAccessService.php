<?php

namespace App\TreasuryAndCash\Application;

use App\SystemAdministration\Models\Branch;
use Illuminate\Database\Eloquent\Collection;

class CashBranchAccessService
{
    public function branchesFor(int $organizationId): Collection
    {
        return Branch::query()
            ->where('organization_id', $organizationId)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);
    }

    public function canManage(int $organizationId, int $branchId): bool
    {
        return Branch::query()
            ->where('organization_id', $organizationId)
            ->whereKey($branchId)
            ->exists();
    }
}