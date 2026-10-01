<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Vault;

function grantVaultSessionViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'vault_session_view_test'],
        ['name' => 'Vault Session View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'vault_sessions.view'],
        [
            'module' => 'vault_sessions',
            'name' => 'View Vault Sessions',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantVaultSessionCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'vault_session_create_test'],
        ['name' => 'Vault Session Create Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'vault_sessions.open'],
        [
            'module' => 'vault_sessions',
            'name' => 'Open Vault Sessions',
            'action' => 'open',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function vaultSessionFixture(): array
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
        'code' => 'VAULT-SESSION-001',
        'name' => 'Main Vault',
        'type' => 'VAULT',
        'is_active' => true,
    ]);
    $vault = Vault::create([
        'cash_location_id' => $location->id,
        'code' => 'V-SESSION-001',
        'name' => 'Main Vault',
        'status' => 'ACTIVE',
        'maximum_balance' => 100000,
    ]);

    return compact('organization', 'branch', 'user', 'branchDay', 'vault');
}

it('loads the vault session list for authorized users', function () {
    $fixture = vaultSessionFixture();
    grantVaultSessionViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-sessions.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/vault-sessions/index'));
});

it('does not expose vault sessions without permission', function () {
    $fixture = vaultSessionFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-sessions.index'))
        ->assertForbidden();
});

it('opens a vault session for the active branch day', function () {
    $fixture = vaultSessionFixture();
    grantVaultSessionCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vault-sessions.open'), [
            'vault_id' => $fixture['vault']->id,
            'opening_cash' => 10000,
            'opening_note' => 'Opening balance',
        ])
        ->assertRedirect(route('vault-sessions.index'));
});
