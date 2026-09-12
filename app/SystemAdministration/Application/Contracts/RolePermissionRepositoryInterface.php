<?php

namespace App\SystemAdministration\Application\Contracts;

use App\SystemAdministration\Models\Role;

interface RolePermissionRepositoryInterface
{
    public function syncPermissions(Role $role, array $permissionIds): Role;
}
