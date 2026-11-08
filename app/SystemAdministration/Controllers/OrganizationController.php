<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\OrganizationService;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Requests\StoreOrganizationRequest;
use App\SystemAdministration\Requests\UpdateOrganizationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function __construct(
        private readonly OrganizationService $organizationService,
    ) {
    }

    public function switchOrganization(Request $request)
    {
        $validated = $request->validate([
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
        ]);

        abort_unless(
            $request->user()->organizations()->whereKey($validated['organization_id'])->exists()
            || $request->user()->organization_id === (int) $validated['organization_id'],
            403,
        );

        $request->session()->put('active_organization_id', $validated['organization_id']);

        return redirect()->back()->with('success', 'Organization context switched successfully.');
        // return redirect()->intended(route('dashboard'));
    }

    /**
     * Display list
     */
    public function index(Request $request)
    {
        $organizations = Organization::query()
            ->where(function ($query) use ($request) {
                $query->whereHas('users', fn($users) => $users->whereKey($request->user()->id))
                    ->orWhere('organizations.id', $request->user()->organization_id);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($request->input('per_page', 18))
            ->withQueryString();

        return Inertia::render('organization-settings/organizations/index', [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        return Inertia::render('organization-settings/organizations/create');
    }

    /**
     * Store new organization
     */
    public function store(StoreOrganizationRequest $request)
    {
        $data = $request->validated();

        try {
            $organization = $this->organizationService->createOrganization(
                $data,
                $request->hasFile('logo') ? $request->file('logo') : null,
            );
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        $request->session()->put('active_organization_id', $organization->id);
        $request->user()->organizations()->syncWithoutDetaching([$organization->id]);

        return redirect()
            ->route('dashboard')
            ->with('success', $organization->name . ' Organization created successfully!');
    }

    /**
     * Show single organization
     */
    public function show(Request $request, Organization $organization)
    {
        $this->authorizeAccess($request, $organization);

        $users = User::query()
            ->forOrganization($organization->id)
            ->orderBy('name')
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->values();
        $canManageUsers = $request->user()->hasPermission('users.update');

        return Inertia::render('organization-settings/organizations/show', [
            'organization' => $organization->load('branches.manager'),
            'users' => $users,
            'canManageUsers' => $canManageUsers,
        ]);
    }

    public function addUser(Request $request, Organization $organization)
    {
        $this->authorizeAccess($request, $organization);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);
        $email = mb_strtolower(trim($validated['email']));
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => 'No user account was found with this email address.',
            ]);
        }

        DB::transaction(function () use ($user, $organization): void {
            $user->organizations()->syncWithoutDetaching([$organization->id]);

            if ($user->organization_id === null) {
                $user->forceFill(['organization_id' => $organization->id])->save();
            }
        });

        return redirect()->route('organizations.show', $organization)
            ->with('success', $user->name . ' added to ' . $organization->name . '.');
    }

    public function removeUser(Request $request, Organization $organization, User $user)
    {
        $this->authorizeAccess($request, $organization);

        abort_unless(
            $user->organization_id === $organization->id
            || $user->organizations()->whereKey($organization->id)->exists(),
            404,
        );

        DB::transaction(function () use ($user, $organization): void {
            $organizationBranchIds = $organization->branches()->pluck('id');
            $remainingOrganizationId = $user->organizations()
                ->where('organizations.id', '!=', $organization->id)
                ->value('organizations.id');

            $user->organizations()->detach($organization->id);
            $user->branches()->detach($organizationBranchIds);

            $updates = [];
            if ($user->organization_id === $organization->id) {
                $updates['organization_id'] = $remainingOrganizationId;
            }
            if ($user->branch_id && $organizationBranchIds->contains($user->branch_id)) {
                $updates['branch_id'] = null;
            }

            if ($updates) {
                $user->forceFill($updates)->save();
            }
        });

        return redirect()->route('organizations.show', $organization)
            ->with('success', $user->name . ' removed from ' . $organization->name . '.');
    }

    /**
     * Show edit form
     */
    public function edit(Organization $organization)
    {
        $this->authorizeAccess(request(), $organization);

        return Inertia::render('organization-settings/organizations/edit', [
            'organization' => $organization,
        ]);
    }

    /**
     * Update organization
     */
    public function update(UpdateOrganizationRequest $request, Organization $organization)
    {
        $this->authorizeAccess($request, $organization);

        $data = $request->validated();

        try {
            $organization = $this->organizationService->updateOrganization(
                $organization,
                $data,
                $request->hasFile('logo') ? $request->file('logo') : null,
            );
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('organizations.index')
            ->with('success', $organization->name . ' Organization updated successfully!');
    }

    /**
     * Delete organization
     */
    public function destroy(Organization $organization)
    {
        $this->authorizeAccess(request(), $organization);

        $this->organizationService->deleteOrganization($organization);

        return redirect()
            ->route('organizations.index')
            ->with('success', $organization->name . ' Organization deleted!');
    }

    private function authorizeAccess(Request $request, Organization $organization): void
    {
        abort_unless(
            $request->user()->organizations()->whereKey($organization->id)->exists()
            || $request->user()->organization_id === $organization->id,
            403,
        );
    }
}