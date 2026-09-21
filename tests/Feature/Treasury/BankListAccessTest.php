<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\Bank;

function grantBankListingPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'banks_view_test'],
        ['name' => 'Banks View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'banks.view'],
        [
            'module' => 'banks',
            'name' => 'View Banks',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function bankListFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $bank = Bank::create([
        'organization_id' => $organization->id,
        'code' => 'BANK-100',
        'name' => 'Citybank',
        'short_name' => 'CB',
        'status' => true,
    ]);

    return compact('organization', 'branch', 'user', 'bank');
}

it('loads banks for authorized organization users', function () {
    $fixture = bankListFixture();
    grantBankListingPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('banks.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/banking/banks/index')
            ->has('banks.data', 1)
            ->where('banks.data.0.name', $fixture['bank']->name));
});

it('does not expose bank records without banking permission', function () {
    $fixture = bankListFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('banks.index'))
        ->assertForbidden();
});
