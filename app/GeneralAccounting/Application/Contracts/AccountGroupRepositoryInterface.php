<?php

namespace App\GeneralAccounting\Application\Contracts;

use App\GeneralAccounting\Models\AccountGroup;
use Illuminate\Database\Eloquent\Builder;

interface AccountGroupRepositoryInterface
{
    public function query(): Builder;

    public function existsByCode(int $organizationId, string $code, ?int $excludeId = null): bool;

    public function create(array $data): AccountGroup;

    public function update(AccountGroup $group, array $data): AccountGroup;

    public function delete(AccountGroup $group): bool;
}
