<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
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
    public function update(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);

        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($request->input('permissions', []));

        return redirect()
            ->route('roles.edit-permissions', $role->id)
            ->with('success', 'Permissions updated successfully!');
    }
}