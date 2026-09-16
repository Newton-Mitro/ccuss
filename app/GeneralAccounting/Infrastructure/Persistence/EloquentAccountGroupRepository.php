<?php

namespace App\GeneralAccounting\Infrastructure\Persistence;

use App\GeneralAccounting\Application\Contracts\AccountGroupRepositoryInterface;
use App\GeneralAccounting\Models\AccountGroup;
use Illuminate\Database\Eloquent\Builder;

class EloquentAccountGroupRepository implements AccountGroupRepositoryInterface
{
    public function query(): Builder
    {
        return AccountGroup::query();
    }

    public function existsByCode(int $organizationId, string $code, ?int $excludeId = null): bool
    {
        return AccountGroup::query()
            ->where('organization_id', $organizationId)
            ->whereRaw('LOWER(code) = ?', [strtolower(trim($code))])
            ->when($excludeId, fn(Builder $query) => $query->where('id', '!=', $excludeId))
            ->exists();
    }

    public function create(array $data): AccountGroup
    {
        return AccountGroup::create($data);
    }

    public function update(AccountGroup $group, array $data): AccountGroup
    {
        $group->update($data);

        return $group->fresh();
    }

    public function delete(AccountGroup $group): bool
    {
        return (bool) $group->delete();
    }
}
