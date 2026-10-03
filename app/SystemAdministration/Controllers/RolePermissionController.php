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
        $roles = Role::with('permissions')->withCount('users')->get();

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
        abort_if($role->preset, 403, 'Preset roles cannot be changed.');

        $this->rolePermissionService->syncPermissions($role, $request->validated('permissions', []));

        return redirect()
            ->back()
            ->with('success', $role->name . ' Permissions updated successfully!');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:roles,slug'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        Role::create([...$validated, 'preset' => false]);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function updateRole(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);
        abort_if($role->preset, 403, 'Preset roles cannot be changed.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:roles,slug,' . $role->id],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $role->update($validated);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy($roleId)
    {
        $role = Role::findOrFail($roleId);
        abort_if($role->preset, 403, 'Preset roles cannot be deleted.');
        abort_if($role->users()->exists(), 422, 'Remove this role from its users before deleting it.');

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}