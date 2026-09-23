<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantHolderManagementPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_holders_manage_test'],
        ['name' => 'Financial Holders Manage Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.accounts.holders.manage'],
        [
            'module' => 'financial_accounts',
            'name' => 'Manage Account Holders',
            'action' => 'manage',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function holderFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    grantHolderManagementPermission($user);
    $primary = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $joint = Customer::factory()->individualFemale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS'])->id,
        'holder_type' => Customer::class,
        'holder_id' => $primary->id,
        'account_type' => 'SAVINGS',
    ]);
    $account->addHolder($primary, 'PRIMARY', null, 50);

    return compact('organization', 'user', 'account', 'primary', 'joint');
}

it('supports joint-holder lifecycle and protects the primary holder', function () {
    $fixture = holderFixture();
    $session = ['active_organization_id' => $fixture['organization']->id];
    $data = [
        'role' => 'JOINT',
        'ownership_percent' => 50,
    ];

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->post(route('financial-accounts.holders.store', $fixture['account']), [
            ...$data,
            'customer_id' => $fixture['joint']->id,
        ])
        ->assertRedirect();

    expect($fixture['account']->holders()->count())->toBe(2);

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->put(route('financial-accounts.holders.update', [$fixture['account'], $fixture['joint']]), [
            'role' => 'JOINT',
            'ownership_percent' => 40,
        ])
        ->assertRedirect();

    expect((float) $fixture['account']->holders()->whereKey($fixture['joint']->id)->first()->pivot->ownership_percent)->toBe(40.0);

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->delete(route('financial-accounts.holders.destroy', [$fixture['account'], $fixture['joint']]))
        ->assertRedirect();

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->delete(route('financial-accounts.holders.destroy', [$fixture['account'], $fixture['primary']]))
        ->assertStatus(422);
});

it('rejects holder ownership above the account allocation', function () {
    $fixture = holderFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.holders.store', $fixture['account']), [
            'customer_id' => $fixture['joint']->id,
            'role' => 'JOINT',
            'ownership_percent' => 51,
        ])
        ->assertStatus(422);
});
