<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;

function grantPettyCashAdvanceAccountPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_advance_accounts_test'],
        ['name' => 'Petty Cash Advance Accounts Test'],
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

function pettyCashAdvanceAccountFixture(): array
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
        'code' => 'PETTY-ADV-001',
        'name' => 'Advance Cash Location',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    $fund = PettyCashFund::create([
        'cash_location_id' => $location->id,
        'custodian_id' => $user->id,
        'code' => 'PC-ADV-001',
        'name' => 'Office Advance Fund',
        'fund_limit' => 20000,
        'current_balance' => 4800,
        'method' => 'IMPREST',
        'status' => 'ACTIVE',
    ]);

    return compact('organization', 'branch', 'user', 'fund');
}

it('loads petty cash advance accounts for authorized users', function () {
    $fixture = pettyCashAdvanceAccountFixture();
    grantPettyCashAdvanceAccountPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('petty-cash-advance-accounts.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/petty-cash/advance-accounts/index')
            ->has('advance_accounts.data', 1)
            ->where('advance_accounts.data.0.custodian_name', $fixture['user']->name));
});

it('does not expose petty cash advance accounts without permission', function () {
    $fixture = pettyCashAdvanceAccountFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('petty-cash-advance-accounts.index'))
        ->assertForbidden();
});
