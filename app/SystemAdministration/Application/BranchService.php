<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\BranchRepositoryInterface;
use App\SystemAdministration\Models\Branch;
use InvalidArgumentException;

class BranchService
{
    public function __construct(
        private readonly BranchRepositoryInterface $branchRepository,
    ) {
    }

    public function createBranch(array $data): Branch
    {
        $organizationId = (int) ($data['organization_id'] ?? 0);
        $code = trim((string) ($data['code'] ?? ''));

        if ($organizationId <= 0) {
            throw new InvalidArgumentException('A valid organization is required.');
        }

        if ($code === '') {
            throw new InvalidArgumentException('Branch code is required.');
        }

        if ($this->branchRepository->existsByCode($organizationId, $code)) {
            throw new \RuntimeException('Branch code already exists for this organization.');
        }

        return $this->branchRepository->create($data);
    }

    public function updateBranch(Branch $branch, array $data): Branch
    {
        $organizationId = (int) ($data['organization_id'] ?? $branch->organization_id);
        $code = trim((string) ($data['code'] ?? $branch->code));

        if ($organizationId <= 0) {
            throw new InvalidArgumentException('A valid organization is required.');
        }

        if ($this->branchRepository->existsByCode($organizationId, $code, $branch->id)) {
            throw new \RuntimeException('Branch code already exists for this organization.');
        }

        return $this->branchRepository->update($branch, $data);
    }

    public function deleteBranch(Branch $branch): bool
    {
        return $this->branchRepository->delete($branch);
    }
}
