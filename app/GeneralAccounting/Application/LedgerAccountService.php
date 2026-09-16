<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\LedgerAccountRepositoryInterface;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\LedgerAccount;
use InvalidArgumentException;
use RuntimeException;

class LedgerAccountService
{
    public function __construct(
        private readonly LedgerAccountRepositoryInterface $accountRepository,
    ) {
    }

    public function create(array $data): LedgerAccount
    {
        $organizationId = (int) ($data['organization_id'] ?? 0);
        $this->validateOrganization($organizationId);
        $this->validateReferences($organizationId, $data);

        if ($this->accountRepository->existsByCode($organizationId, $data['code'])) {
            throw new RuntimeException('Ledger account code already exists for this organization.');
        }

        $data['level'] = $this->parentLevel($data['parent_id'] ?? null);

        return $this->accountRepository->create($data);
    }

    public function update(LedgerAccount $account, array $data): LedgerAccount
    {
        $this->validateReferences($account->organization_id, $data, $account->id);

        if ($this->accountRepository->existsByCode($account->organization_id, $data['code'], $account->id)) {
            throw new RuntimeException('Ledger account code already exists for this organization.');
        }

        $data['level'] = $this->parentLevel($data['parent_id'] ?? null);

        return $this->accountRepository->update($account, $data);
    }

    public function delete(LedgerAccount $account): bool
    {
        if ($account->children()->exists()) {
            throw new RuntimeException('A ledger account with child accounts cannot be deleted.');
        }

        return $this->accountRepository->delete($account);
    }

    private function validateOrganization(int $organizationId): void
    {
        if ($organizationId <= 0) {
            throw new InvalidArgumentException('A valid organization is required.');
        }
    }

    private function validateReferences(int $organizationId, array $data, ?int $excludedId = null): void
    {
        $group = AccountGroup::query()
            ->where('organization_id', $organizationId)
            ->find($data['account_group_id'] ?? null);

        if (!$group) {
            throw new InvalidArgumentException('The selected account group is invalid.');
        }

        if (($data['parent_id'] ?? null) !== null && ($data['parent_id'] ?? '') !== '') {
            $parent = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->find((int) $data['parent_id']);

            if (!$parent || ($excludedId !== null && $parent->id === $excludedId)) {
                throw new InvalidArgumentException('The selected ledger account parent is invalid.');
            }
        }
    }

    private function parentLevel(mixed $parentId): int
    {
        if ($parentId === null || $parentId === '') {
            return 0;
        }

        return (int) LedgerAccount::query()->whereKey($parentId)->value('level') + 1;
    }
}
