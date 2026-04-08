<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function searchUsers(Request $request): JsonResponse
    {
        $search = $request->query('search');

        if (!$search) {
            return response()->json(['data' => []]);
        }

        $users = User::with(['organization', 'branch'])
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->limit(20)
            ->get();

        return response()->json(['data' => $users]);
    }

    /* ==========================
     * INDEX
     * ========================== */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'per_page', 'page']);
        $perPage = $filters['per_page'] ?? 10;

        $users = User::with(['organization', 'branch'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('system-administration/users/user-index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    /* ==========================
     * CREATE
     * ========================== */
    public function create()
    {
        return Inertia::render('system-administration/users/user-form-page', [
            'roles' => Role::all(),
            'organizations' => Organization::all(),
            'branches' => Branch::all(),
        ]);
    }

    /* ==========================
     * STORE
     * ========================== */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'organization_id' => 'required|exists:organizations,id',
            'branch_id' => 'required|exists:branches,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
            'status' => 'nullable|in:active,inactive',
            'photo' => 'nullable|image|max:2048',
        ]);

        // Upload photo
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('uploads/users', 'public');
        }

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'photo_path' => $photoPath,
            'status' => $validated['status'] ?? 'inactive',
        ]);

        if (!empty($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /* ==========================
     * SHOW
     * ========================== */
    public function show(User $user)
    {
        $user->load(['organization', 'branch', 'roles.permissions']);

        return Inertia::render(
            'system-administration/users/show-user-page',
            compact('user')
        );
    }

    /* ==========================
     * EDIT
     * ========================== */
    public function edit(User $user)
    {
        return Inertia::render('system-administration/users/user-form-page', [
            'user' => $user->load('roles'),
            'roles' => Role::all(),
            'organizations' => Organization::all(),
            'branches' => Branch::all(),
        ]);
    }

    /* ==========================
     * UPDATE
     * ========================== */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:6|confirmed',
            'organization_id' => 'required|exists:organizations,id',
            'branch_id' => 'required|exists:branches,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
            'status' => 'nullable|in:active,inactive',
            'photo' => 'nullable|image|max:2048',
        ]);

        // Handle photo update
        if ($request->hasFile('photo')) {
            // Delete old photo
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }

            $validated['photo_path'] = $request->file('photo')->store('uploads/users', 'public');
        }

        // Handle password safely
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /* ==========================
     * DESTROY
     * ========================== */
    public function destroy(User $user)
    {
        // Delete photo
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}