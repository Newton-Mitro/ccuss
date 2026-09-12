<?php

namespace App\SystemAdministration\Application\Contracts;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Builder;

interface OrganizationRepositoryInterface
{
    public function query(): Builder;

    public function existsByCode(string $code, ?int $excludeId = null): bool;

    public function create(array $data): Organization;

    public function update(Organization $organization, array $data): Organization;

    public function delete(Organization $organization): bool;
}
