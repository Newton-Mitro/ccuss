<?php

namespace App\SystemAdministration\Application\Contracts;

use App\SystemAdministration\Models\Branch;
use Illuminate\Database\Eloquent\Builder;

interface BranchRepositoryInterface
{
    public function query(): Builder;

    public function existsByCode(int $organizationId, string $code, ?int $excludeId = null): bool;

    public function create(array $data): Branch;

    public function update(Branch $branch, array $data): Branch;

    public function delete(Branch $branch): bool;
}
