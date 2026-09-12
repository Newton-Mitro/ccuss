<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\RolePermissionService;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Requests\UpdateRolePermissionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    public function __construct(
        private readonly RolePermissionService $rolePermissionService,
    ) {
    }

    /**
     * Show the form for editing a role's permissions.
     */
    public function index()
    {
        // Fetch all roles with their assigned permissions
        $roles = Role::with('permissions')->get();

        // Fetch all available permissions
        $permissions = Permission::all();

        return Inertia::render('system-administration/roles/role-permissions', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the permissions for a given role.
     */
    public function update(UpdateRolePermissionRequest $request, $roleId)
    {
        $role = Role::findOrFail($roleId);

        $this->rolePermissionService->syncPermissions($role, $request->validated('permissions', []));

        return redirect()
            ->back()
            ->with('success', $role->name . ' Permissions updated successfully!');
    }
}