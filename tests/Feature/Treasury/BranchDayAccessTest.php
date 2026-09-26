<?php

use App\TreasuryAndCash\Models\BranchDay;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantBranchDayPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'branch_days_view_test'],
        ['name' => 'Branch Days View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'branch_days.view'],
        [
            'module' => 'treasury',
            'name' => 'View Branch Days',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantBranchDayLifecyclePermissions(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'branch_days_lifecycle_test'],
        ['name' => 'Branch Days Lifecycle Test'],
    );

    $permissions = collect([
        ['slug' => 'branch_days.open', 'name' => 'Open Branch Day', 'action' => 'open'],
        ['slug' => 'branch_days.close', 'name' => 'Close Branch Day', 'action' => 'close'],
    ])->map(fn(array $permission) => Permission::firstOrCreate(
            ['slug' => $permission['slug']],
            [
                'module' => 'branch_days',
                'name' => $permission['name'],
                'action' => $permission['action'],
            ],
        ));

    $role->permissions()->syncWithoutDetaching($permissions->pluck('id'));
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('loads the branch day index page for users with branch-day access', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    grantBranchDayPermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('branch-days.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('treasury-cash/branch-days/index'));
});

it('loads the dedicated branch day creation page for users with open access', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    grantBranchDayLifecyclePermissions($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('branch-days.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('treasury-cash/branch-days/create'));
});

it('forbids users without branch-day access from the branch day index', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('branch-days.index'))
        ->assertForbidden();
});

it('opens and closes a branch day for the authenticated users branch', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    grantBranchDayLifecyclePermissions($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('branch-days.open'), [
            'business_date' => '2026-09-18',
            'opening_note' => 'Morning opening',
        ])
        ->assertRedirect(route('branch-days.index'));

    $branchDay = BranchDay::query()->firstOrFail();

    expect($branchDay->organization_id)->toBe($organization->id)
        ->and($branchDay->branch_id)->toBe($branch->id)
        ->and($branchDay->status)->toBe('OPEN')
        ->and($branchDay->opened_by)->toBe($user->id)
        ->and($branchDay->opening_note)->toBe('Morning opening');

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('branch-days.close', $branchDay), [
            'closing_note' => 'Day closed',
        ])
        ->assertRedirect(route('branch-days.index'));

    expect($branchDay->fresh()->status)->toBe('CLOSED')
        ->and($branchDay->fresh()->closed_by)->toBe($user->id)
        ->and($branchDay->fresh()->closing_note)->toBe('Day closed')
        ->and($branchDay->fresh()->closed_at)->not->toBeNull();
});

it('redirects with an error when opening a branch day without a branch assignment', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => null,
    ]);

    grantBranchDayLifecyclePermissions($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->from(route('branch-days.index'))
        ->post(route('branch-days.open'), [
            'business_date' => '2026-09-18',
            'opening_note' => 'Morning opening',
        ])
        ->assertRedirect(route('branch-days.index'))
        ->assertSessionHas('error', 'A branch assignment is required to open a branch day.');
});

it('rejects opening a second branch day for the same branch and date', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    grantBranchDayLifecyclePermissions($user);

    $service = app(\App\TreasuryAndCash\Application\BranchDayService::class);
    $service->open($organization->id, $branch->id, $user->id, '2026-09-18');

    expect(fn() => $service->open($organization->id, $branch->id, $user->id, '2026-09-18'))
        ->toThrow(RuntimeException::class, 'A branch day already exists for this branch and date.');
});
