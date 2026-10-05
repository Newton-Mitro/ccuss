<?php

namespace App\TreasuryAndCash\Application;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CashBranchAccessService
{
    public function branchesFor(User $user, int $organizationId): Collection
    {
        $assignedBranchIds = $user->branches()
            ->where('branches.organization_id', $organizationId)
            ->pluck('branches.id')
            ->map(fn($branchId): int => (int) $branchId);

        if ($user->branch_id) {
            $assignedBranchIds->push((int) $user->branch_id);
        }

        return Branch::query()
            ->where('organization_id', $organizationId)
            ->whereIn('id', $assignedBranchIds->unique()->values())
            ->orderBy('name')
            ->get(['id', 'code', 'name']);
    }

    public function canManage(User $user, int $organizationId, int $branchId): bool
    {
        return $this->branchesFor($user, $organizationId)
            ->contains(fn(Branch $branch): bool => (int) $branch->id === $branchId);
    }
}