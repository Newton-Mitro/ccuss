<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;

function grantPettyCashViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_view_test'],
        ['name' => 'Petty Cash View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.view'],
        [
            'module' => 'petty_cash',
            'name' => 'View Petty Cash',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function pettyCashFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $location = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'PETTY-001',
        'name' => 'Main Petty Cash Location',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    $fund = PettyCashFund::create([
        'cash_location_id' => $location->id,
        'custodian_id' => $user->id,
        'code' => 'PC-001',
        'name' => 'Main Petty Cash Fund',
        'fund_limit' => 10000,
        'current_balance' => 3500,
        'method' => 'IMPREST',
        'status' => 'ACTIVE',
    ]);

    return compact('organization', 'branch', 'user', 'location', 'fund');
}

it('loads petty cash accounts for authorized organization users', function () {
    $fixture = pettyCashFixture();
    grantPettyCashViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('petty-cash-accounts.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/petty-cash/accounts/index')
            ->has('funds.data', 1)
            ->where('funds.data.0.code', $fixture['fund']->code));
});

it('does not expose petty cash accounts without permission', function () {
    $fixture = pettyCashFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('petty-cash-accounts.index'))
        ->assertForbidden();
});
