<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;

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
    ])->map(fn (array $permission) => Permission::firstOrCreate(
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
        ->assertInertia(fn ($page) => $page
            ->component('treasury-cash/branch-days/index')
            ->where('auth.user.branch_id', $branch->id)
            ->where('auth.user.branch.name', $branch->name)
            ->where('organization.activeId', $organization->id));
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
        ->assertInertia(fn ($page) => $page
            ->component('treasury-cash/branch-days/create')
            ->where('organization.activeId', $organization->id)
            ->where('auth.user.branch.name', $branch->name));
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

it('blocks closing a branch day until its sessions and pending cash transactions are settled', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $branchDay = BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => '2026-09-18',
        'status' => BranchDay::STATUS_OPEN,
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $location = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'BRANCH-DAY-CLOSE-TELLER',
        'name' => 'Branch Day Close Teller',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $location->id,
        'user_id' => $user->id,
        'code' => 'BRANCH-DAY-CLOSE-001',
        'name' => 'Branch Day Close Teller',
        'status' => 'ACTIVE',
    ]);
    $session = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $teller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 100,
        'opened_at' => now(),
    ]);
    $service = app(\App\TreasuryAndCash\Application\BranchDayService::class);

    grantBranchDayLifecyclePermissions($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->from(route('branch-days.index'))
        ->post(route('branch-days.close', $branchDay), [])
        ->assertRedirect(route('branch-days.index'))
        ->assertSessionHas('error', fn (string $message) => str_contains(
            $message,
            '1 open teller session',
        ));

    expect($branchDay->fresh()->status)->toBe(BranchDay::STATUS_OPEN);

    expect(fn () => $service->close($branchDay, $user->id))
        ->toThrow(RuntimeException::class, '1 open teller session');

    $session->update(['status' => 'CLOSED']);
    $transaction = TellerCashTransaction::create([
        'branch_day_id' => $branchDay->id,
        'cash_location_id' => $location->id,
        'teller_session_id' => $session->id,
        'transaction_no' => 'BRANCH-DAY-PENDING-001',
        'type' => 'DEPOSIT',
        'amount' => 25,
        'status' => 'PENDING',
    ]);

    expect(fn () => $service->close($branchDay, $user->id))
        ->toThrow(RuntimeException::class, '1 pending teller transaction');

    $transaction->update(['status' => 'POSTED']);

    expect($service->close($branchDay, $user->id)->status)
        ->toBe(BranchDay::STATUS_CLOSED);
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

    expect(fn () => $service->open($organization->id, $branch->id, $user->id, '2026-09-18'))
        ->toThrow(RuntimeException::class, 'A branch day already exists for this branch and date.');
});

it('rejects opening another business date while the branch already has an open day', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    $service = app(\App\TreasuryAndCash\Application\BranchDayService::class);
    $openBranchDay = $service->open($organization->id, $branch->id, $user->id, '2026-09-18');

    expect(fn () => $service->open($organization->id, $branch->id, $user->id, '2026-09-19'))
        ->toThrow(RuntimeException::class, 'A branch day is already open for this branch. Close it before opening another business date.');

    $service->close($openBranchDay, $user->id);

    expect($service->open($organization->id, $branch->id, $user->id, '2026-09-19')->status)
        ->toBe(BranchDay::STATUS_OPEN);
});
