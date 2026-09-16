<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Models\CostCenter;
use InvalidArgumentException;
use RuntimeException;

class CostCenterService
{
    public function create(array $data): CostCenter
    {
        $organizationId = (int) ($data['organization_id'] ?? 0);
        $this->validateOrganization($organizationId);
        $this->validateParent($organizationId, $data['parent_id'] ?? null);

        if ($this->codeExists($organizationId, $data['code'])) {
            throw new RuntimeException('Cost center code already exists for this organization.');
        }

        $data['level'] = $this->parentLevel($data['parent_id'] ?? null);

        return CostCenter::create($data);
    }

    public function update(CostCenter $costCenter, array $data): CostCenter
    {
        $this->validateParent($costCenter->organization_id, $data['parent_id'] ?? null, $costCenter->id);

        if ($this->codeExists($costCenter->organization_id, $data['code'], $costCenter->id)) {
            throw new RuntimeException('Cost center code already exists for this organization.');
        }

        $data['level'] = $this->parentLevel($data['parent_id'] ?? null);
        $costCenter->update($data);

        return $costCenter->fresh();
    }

    public function delete(CostCenter $costCenter): bool
    {
        if ($costCenter->children()->exists()) {
            throw new RuntimeException('A cost center with child cost centers cannot be deleted.');
        }

        if ($costCenter->voucherEntries()->exists()) {
            throw new RuntimeException('A cost center referenced by voucher entries cannot be deleted.');
        }

        return (bool) $costCenter->delete();
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

        $parent = CostCenter::query()
            ->where('organization_id', $organizationId)
            ->find((int) $parentId);

        if (!$parent || ($excludedId !== null && $parent->id === $excludedId)) {
            throw new InvalidArgumentException('The selected cost center parent is invalid.');
        }
    }

    private function parentLevel(mixed $parentId): int
    {
        if ($parentId === null || $parentId === '') {
            return 0;
        }

        return (int) CostCenter::query()->whereKey($parentId)->value('level') + 1;
    }

    private function codeExists(int $organizationId, string $code, ?int $excludedId = null): bool
    {
        return CostCenter::query()
            ->where('organization_id', $organizationId)
            ->whereRaw('LOWER(code) = ?', [strtolower(trim($code))])
            ->when($excludedId, fn($query) => $query->where('id', '!=', $excludedId))
            ->exists();
    }
}
