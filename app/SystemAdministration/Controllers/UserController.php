<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // -----------------------------
    // INDEX: List users with filters + pagination
    // -----------------------------
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'per_page', 'page']);
        $perPage = $filters['per_page'] ?? 10;

        $users = User::with(['organization', 'branch', 'roles'])
            ->when(
                $filters['search'] ?? null,
                fn($query, $search) =>
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
            )
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('system-administration/users/user-index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    // -----------------------------
    // CREATE: Show form
    // -----------------------------
    public function create()
    {
        $roles = Role::all();
        $organizations = Organization::all();
        $branches = Branch::all();
        return Inertia::render('system-administration/users/user-form-page', compact('roles', 'organizations', 'branches'));
    }

    // -----------------------------
    // STORE: Save new user
    // -----------------------------
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'organization_id' => 'required|exists:organizations,id',
            'branch_id' => 'required|exists:branches,id',
            'roles' => 'array|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'organization_id' => $validated['organization_id'],
            'branch_id' => $validated['branch_id'],
        ]);

        if (!empty($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    // -----------------------------
    // SHOW: User details
    // -----------------------------
    public function show(User $user)
    {
        $user->load(['organization', 'branch', 'roles', 'permissions']);
        return Inertia::render('Users/Show', compact('user'));
    }

    // -----------------------------
    // EDIT: Show edit form
    // -----------------------------
    public function edit(User $user)
    {
        $roles = Role::all();
        $user->load('roles');
        return Inertia::render('Users/Edit', compact('user', 'roles'));
    }

    // -----------------------------
    // UPDATE: Save changes
    // -----------------------------
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6|confirmed',
            'organization_id' => 'required|exists:organizations,id',
            'branch_id' => 'required|exists:branches,id',
            'roles' => 'array|exists:roles,id',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'organization_id' => $validated['organization_id'],
            'branch_id' => $validated['branch_id'],
            'password' => $validated['password'] ? Hash::make($validated['password']) : $user->password,
        ]);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    // -----------------------------
    // DESTROY: Delete user
    // -----------------------------
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    // -----------------------------
    // ASSIGN ROLES: Update roles separately
    // -----------------------------
    public function updateRoles(Request $request, User $user)
    {
        $validated = $request->validate([
            'roles' => 'array|exists:roles,id',
        ]);

        $user->roles()->sync($validated['roles'] ?? []);

        return redirect()->back()->with('success', 'User roles updated successfully.');
    }
}