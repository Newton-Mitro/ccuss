<?php

namespace App\SystemAdministration\Infrastructure\Persistence;

use App\SystemAdministration\Application\Contracts\BranchRepositoryInterface;
use App\SystemAdministration\Models\Branch;
use Illuminate\Database\Eloquent\Builder;

class EloquentBranchRepository implements BranchRepositoryInterface
{
    public function query(): Builder
    {
        return Branch::query();
    }

    public function existsByCode(int $organizationId, string $code, ?int $excludeId = null): bool
    {
        $query = Branch::query()
            ->where('organization_id', $organizationId)
            ->whereRaw('LOWER(code) = ?', [strtolower(trim($code))]);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): Branch
    {
        return Branch::create($data);
    }

    public function update(Branch $branch, array $data): Branch
    {
        $branch->update($data);

        return $branch->fresh();
    }

    public function delete(Branch $branch): bool
    {
        return (bool) $branch->delete();
    }
}
