<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\AccountGroupRepositoryInterface;
use App\GeneralAccounting\Models\AccountGroup;
use InvalidArgumentException;
use RuntimeException;

class AccountGroupService
{
    public function __construct(
        private readonly AccountGroupRepositoryInterface $groupRepository,
    ) {
    }

    public function create(array $data): AccountGroup
    {
        $organizationId = (int) ($data['organization_id'] ?? 0);
        $this->validateOrganization($organizationId);
        $this->validateParent($organizationId, $data['parent_id'] ?? null);

        if ($this->groupRepository->existsByCode($organizationId, $data['code'])) {
            throw new RuntimeException('Account group code already exists for this organization.');
        }

        $data['level'] = $this->parentLevel($data['parent_id'] ?? null);

        return $this->groupRepository->create($data);
    }

    public function update(AccountGroup $group, array $data): AccountGroup
    {
        $this->validateParent($group->organization_id, $data['parent_id'] ?? null, $group->id);

        if ($this->groupRepository->existsByCode($group->organization_id, $data['code'], $group->id)) {
            throw new RuntimeException('Account group code already exists for this organization.');
        }

        $data['level'] = $this->parentLevel($data['parent_id'] ?? null);

        return $this->groupRepository->update($group, $data);
    }

    public function delete(AccountGroup $group): bool
    {
        if ($group->children()->exists() || $group->accounts()->exists()) {
            throw new RuntimeException('An account group with children or ledger accounts cannot be deleted.');
        }

        return $this->groupRepository->delete($group);
    }

    private function validateOrganization(int $organizationId): void
    {
        if ($organizationId <= 0) {
            throw new InvalidArgumentException('A valid organization is required.');
        }
    }

    private function validateParent(int $organizationId, mixed $parentId, ?int $excludedId = null): void
    {
        if ($parentId === null || $parentId === '') {
            return;
        }

        $parent = AccountGroup::query()
            ->where('organization_id', $organizationId)
            ->find((int) $parentId);

        if (!$parent || ($excludedId !== null && $parent->id === $excludedId)) {
            throw new InvalidArgumentException('The selected account group parent is invalid.');
        }
    }

    private function parentLevel(mixed $parentId): int
    {
        if ($parentId === null || $parentId === '') {
            return 0;
        }

        return (int) AccountGroup::query()->whereKey($parentId)->value('level') + 1;
    }
}
