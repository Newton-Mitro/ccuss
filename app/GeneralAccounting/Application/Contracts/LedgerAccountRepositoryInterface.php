<?php

namespace App\GeneralAccounting\Application\Contracts;

use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Builder;

interface LedgerAccountRepositoryInterface
{
    public function query(): Builder;

    public function existsByCode(int $organizationId, string $code, ?int $excludeId = null): bool;

    public function create(array $data): LedgerAccount;

    public function update(LedgerAccount $account, array $data): LedgerAccount;

    public function delete(LedgerAccount $account): bool;
}
