<?php

namespace App\GeneralAccounting\Infrastructure\Persistence;

use App\GeneralAccounting\Application\Contracts\LedgerAccountRepositoryInterface;
use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Builder;

class EloquentLedgerAccountRepository implements LedgerAccountRepositoryInterface
{
    public function query(): Builder
    {
        return LedgerAccount::query();
    }

    public function existsByCode(int $organizationId, string $code, ?int $excludeId = null): bool
    {
        return LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->whereRaw('LOWER(code) = ?', [strtolower(trim($code))])
            ->when($excludeId, fn(Builder $query) => $query->where('id', '!=', $excludeId))
            ->exists();
    }

    public function create(array $data): LedgerAccount
    {
        return LedgerAccount::create($data);
    }

    public function update(LedgerAccount $account, array $data): LedgerAccount
    {
        $account->update($data);

        return $account->fresh();
    }

    public function delete(LedgerAccount $account): bool
    {
        return (bool) $account->delete();
    }
}
