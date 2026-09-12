<?php

namespace App\SystemAdministration\Infrastructure\Persistence;

use App\SystemAdministration\Application\Contracts\OrganizationRepositoryInterface;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Builder;

class EloquentOrganizationRepository implements OrganizationRepositoryInterface
{
    public function query(): Builder
    {
        return Organization::query();
    }

    public function existsByCode(string $code, ?int $excludeId = null): bool
    {
        $query = Organization::query()->whereRaw('LOWER(code) = ?', [strtolower(trim($code))]);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): Organization
    {
        return Organization::create($data);
    }

    public function update(Organization $organization, array $data): Organization
    {
        $organization->update($data);

        return $organization->fresh();
    }

    public function delete(Organization $organization): bool
    {
        return (bool) $organization->delete();
    }
}
