<?php

namespace App\SystemAdministration\Infrastructure\Persistence;

use App\SystemAdministration\Application\Contracts\RolePermissionRepositoryInterface;
use App\SystemAdministration\Models\Role;

class EloquentRolePermissionRepository implements RolePermissionRepositoryInterface
{
    public function syncPermissions(Role $role, array $permissionIds): Role
    {
        $role->permissions()->sync(array_values(array_unique(array_filter($permissionIds))));

        return $role->fresh(['permissions']);
    }
}
