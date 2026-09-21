<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\Vault;

function grantCashManagementViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_management_view_test'],
        ['name' => 'Cash Management View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_management.view'],
        [
            'module' => 'cash_management',
            'name' => 'View Cash Management',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantCashManagementCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_management_create_test'],
        ['name' => 'Cash Management Create Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_management.create'],
        [
            'module' => 'cash_management',
            'name' => 'Create Cash Management',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function cashManagementFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $vaultLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'VAULT-001',
        'name' => 'Main Vault Location',
        'type' => 'VAULT',
        'is_active' => true,
    ]);
    $vault = Vault::create([
        'cash_location_id' => $vaultLocation->id,
        'code' => 'V-001',
        'name' => 'Main Vault',
        'status' => 'ACTIVE',
        'maximum_balance' => 100000,
    ]);
    $tellerLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TELLER-001',
        'name' => 'Teller Location',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $tellerLocation->id,
        'user_id' => $user->id,
        'code' => 'T-001',
        'name' => 'Main Teller',
        'status' => 'ACTIVE',
        'maximum_cash' => 25000,
    ]);

    return compact('organization', 'branch', 'user', 'vault', 'teller');
}

it('loads vault and teller list pages for authorized organization users', function () {
    $fixture = cashManagementFixture();
    grantCashManagementViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vaults.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/vaults/index')
            ->has('vaults.data', 1)
            ->where('vaults.data.0.code', $fixture['vault']->code));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('tellers.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/tellers/index')
            ->has('tellers.data', 1)
            ->where('tellers.data.0.code', $fixture['teller']->code));
});

it('does not expose cash management pages without permission', function () {
    $fixture = cashManagementFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vaults.index'))
        ->assertForbidden();
});

it('creates a vault and teller for the users active branch', function () {
    $fixture = cashManagementFixture();
    grantCashManagementCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vaults.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('treasury-cash/vaults/create'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vaults.store'), [
            'code' => 'VAULT-002',
            'name' => 'Secondary Vault',
            'maximum_balance' => 50000,
            'status' => 'ACTIVE',
        ])
        ->assertRedirect(route('vaults.index'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('tellers.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/tellers/create')
            ->has('users'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('tellers.store'), [
            'user_id' => $fixture['user']->id,
            'code' => 'T-002',
            'name' => 'Second Teller',
            'maximum_cash' => 15000,
            'status' => 'ACTIVE',
        ])
        ->assertRedirect(route('tellers.index'));

    expect(Vault::query()->where('code', 'VAULT-002')->exists())->toBeTrue()
        ->and(Teller::query()->where('code', 'T-002')->exists())->toBeTrue();
});
