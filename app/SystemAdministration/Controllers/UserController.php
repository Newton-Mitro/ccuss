<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\UserService;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Requests\StoreUserRequest;
use App\SystemAdministration\Requests\UpdateUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {
    }

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
            ->limit(18)
            ->get();

        return response()->json(['data' => $users]);
    }

    /* ==========================
     * INDEX
     * ========================== */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'per_page', 'page']);
        $perPage = $filters['per_page'] ?? 18;

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
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        try {
            $user = $this->userService->createUser(
                $validated,
                $request->hasFile('photo') ? $request->file('photo') : null,
            );
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->route('users.index')
            ->with('success', $user->name . ' User created successfully.');
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
        // Fetch all roles with their assigned permissions
        $roles = Role::with('permissions')->get();

        // Fetch all available permissions
        $permissions = Permission::all();

        return Inertia::render('system-administration/users/user-form-page', [
            'user' => $user->load('roles'),
            'roles' => $roles,
            'organizations' => Organization::all(),
            'branches' => Branch::all(),
            'permissions' => $permissions,
        ]);
    }

    /* ==========================
     * UPDATE
     * ========================== */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        try {
            $user = $this->userService->updateUser(
                $user,
                $validated,
                $request->hasFile('photo') ? $request->file('photo') : null,
            );
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->route('users.index')
            ->with('success', $user->name . ' User updated successfully.');
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
            ->with('success', $user->name . ' User deleted successfully.');
    }
}