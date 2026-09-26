<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;

function grantTellerSessionViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_sessions_view_test'],
        ['name' => 'Teller Sessions View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'teller_sessions.view'],
        [
            'module' => 'teller_sessions',
            'name' => 'View Teller Sessions',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerSessionLifecyclePermissions(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_sessions_lifecycle_test'],
        ['name' => 'Teller Sessions Lifecycle Test'],
    );

    $permissions = collect([
        ['slug' => 'teller_sessions.open', 'name' => 'Open Teller Sessions', 'action' => 'open'],
        ['slug' => 'teller_sessions.close', 'name' => 'Close Teller Sessions', 'action' => 'close'],
    ])->map(fn(array $permission) => Permission::firstOrCreate(
            ['slug' => $permission['slug']],
            [
                'module' => 'teller_sessions',
                'name' => $permission['name'],
                'action' => $permission['action'],
            ],
        ));

    $role->permissions()->syncWithoutDetaching($permissions->pluck('id'));
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function tellerSessionFixture(): array
{
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
        'status' => 'OPEN',
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $location = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TELLER-SESSION-001',
        'name' => 'Session Teller Location',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $location->id,
        'user_id' => $user->id,
        'code' => 'TS-001',
        'name' => 'Session Teller',
        'status' => 'ACTIVE',
        'maximum_cash' => 25000,
    ]);
    $session = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $teller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 5000,
        'opened_at' => now(),
    ]);

    return compact('organization', 'branch', 'user', 'branchDay', 'teller', 'session');
}

it('assigns teller session permissions to the branch manager role by default', function () {
    $role = Role::firstOrCreate(['slug' => 'branch_manager'], ['name' => 'Branch Manager']);
    $permission = Permission::firstOrCreate(
        ['slug' => 'teller_sessions.view'],
        ['module' => 'teller_sessions', 'name' => 'View Teller Sessions', 'action' => 'view'],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);

    expect($role->permissions()->where('slug', 'teller_sessions.view')->exists())->toBeTrue();
});

it('loads teller sessions for authorized organization users', function () {
    $fixture = tellerSessionFixture();
    grantTellerSessionViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-sessions.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-sessions/index')
            ->has('teller_sessions.data', 1)
            ->has('tellers', 1)
            ->where('branch_day.id', $fixture['branchDay']->id)
            ->where('teller_sessions.data.0.id', $fixture['session']->id)
            ->where('teller_sessions.data.0.teller.code', $fixture['teller']->code));
});

it('loads the dedicated teller session creation page for users with open access', function () {
    $fixture = tellerSessionFixture();
    grantTellerSessionLifecyclePermissions($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-sessions.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('treasury-cash/teller-sessions/create'));
});

it('does not expose teller sessions without permission', function () {
    $fixture = tellerSessionFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-sessions.index'))
        ->assertForbidden();
});

it('opens and closes a teller session for an active branch day', function () {
    $fixture = tellerSessionFixture();
    grantTellerSessionLifecyclePermissions($fixture['user']);

    $freshLocation = CashLocation::create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'code' => 'TELLER-SESSION-002',
        'name' => 'Fresh Teller Location',
        'type' => 'TELLER',
        'is_active' => true,
    ]);

    $freshTeller = Teller::create([
        'cash_location_id' => $freshLocation->id,
        'user_id' => $fixture['user']->id,
        'code' => 'TS-002',
        'name' => 'Fresh Teller',
        'status' => 'ACTIVE',
        'maximum_cash' => 25000,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-sessions.open'), [
            'teller_id' => $freshTeller->id,
            'opening_cash' => 5500,
            'opening_note' => 'Session opened',
        ])
        ->assertRedirect(route('teller-sessions.index'));

    $session = TellerSession::query()->latest('id')->first();

    expect($session)->not->toBeNull()
        ->and($session->teller_id)->toBe($freshTeller->id)
        ->and($session->opening_cash)->toBe('5500.0000')
        ->and($session->status)->toBe('OPEN');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-sessions.close', $session), [
            'closing_cash' => 5300,
            'closing_note' => 'Session closed',
        ])
        ->assertRedirect(route('teller-sessions.index'));

    expect($session->fresh()->status)->toBe('CLOSED')
        ->and($session->fresh()->closing_cash)->toBe('5300.0000')
        ->and($session->fresh()->cash_difference)->toBe('-200.0000');
});
