<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\RolePermissionRepositoryInterface;
use App\SystemAdministration\Models\Role;

class RolePermissionService
{
    public function __construct(
        private readonly RolePermissionRepositoryInterface $rolePermissionRepository,
    ) {
    }

    public function syncPermissions(Role $role, array $permissionIds): Role
    {
        return $this->rolePermissionRepository->syncPermissions($role, $permissionIds);
    }
}
