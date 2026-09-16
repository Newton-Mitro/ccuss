<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\UserService;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Requests\StoreUserRequest;
use App\SystemAdministration\Requests\UpdateUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

        $users = $this->organizationUsers($request)->with('branch')
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

        $users = $this->organizationUsers($request)->with('branch')
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
    public function create(Request $request)
    {
        return Inertia::render('system-administration/users/user-form-page', [
            'roles' => Role::all(),
            'branches' => $this->organizationBranches($request)->get(),
        ]);
    }

    /* ==========================
     * STORE
     * ========================== */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['organization_id'] = $this->activeOrganizationId($request);
        $this->ensureBranchBelongsToOrganization(
            isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            $request,
        );

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
        $this->authorizeOrganization($user, request());

        $user->load(['branch', 'roles.permissions']);

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
        $this->authorizeOrganization($user, request());

        // Fetch all roles with their assigned permissions
        $roles = Role::with('permissions')->get();

        // Fetch all available permissions
        $permissions = Permission::all();

        return Inertia::render('system-administration/users/user-form-page', [
            'user' => $user->load('roles'),
            'roles' => $roles,
            'branches' => $this->organizationBranches(request())->get(),
            'permissions' => $permissions,
        ]);
    }

    /* ==========================
     * UPDATE
     * ========================== */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        $this->authorizeOrganization($user, $request);
        $validated['organization_id'] = $this->activeOrganizationId($request);
        $this->ensureBranchBelongsToOrganization(
            isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            $request,
        );

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
        $this->authorizeOrganization($user, request());

        // Delete photo
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', $user->name . ' User deleted successfully.');
    }

    private function organizationUsers(Request $request)
    {
        return User::query()->where('organization_id', $this->activeOrganizationId($request));
    }

    private function organizationBranches(Request $request)
    {
        return Branch::query()->where('organization_id', $this->activeOrganizationId($request));
    }

    private function activeOrganizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function ensureBranchBelongsToOrganization(?int $branchId, Request $request): void
    {
        if ($branchId === null) {
            return;
        }

        abort_unless(
            $this->organizationBranches($request)->whereKey($branchId)->exists(),
            422,
        );
    }

    private function authorizeOrganization(User $user, Request $request): void
    {
        abort_unless($user->organization_id === $this->activeOrganizationId($request), 404);
    }
}