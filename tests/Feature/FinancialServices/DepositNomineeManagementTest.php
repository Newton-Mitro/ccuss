<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\DepositNominee;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantNomineeManagementPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_nominees_manage_test'],
        ['name' => 'Financial Nominees Manage Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.accounts.nominees.manage'],
        [
            'module' => 'financial_accounts',
            'name' => 'Manage Account Nominees',
            'action' => 'manage',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function nomineeFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantNomineeManagementPermission($user);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
    ]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
    ]);

    return compact('organization', 'user', 'account');
}

it('supports nominee creation, update, and removal', function () {
    $fixture = nomineeFixture();
    $session = ['active_organization_id' => $fixture['organization']->id];
    $data = [
        'name' => 'Primary Nominee',
        'relationship' => 'SPOUSE',
        'phone' => '01700000000',
        'share_percent' => 60,
        'is_primary' => true,
    ];

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->post(route('financial-accounts.nominees.store', $fixture['account']), $data)
        ->assertRedirect();

    $nominee = DepositNominee::query()->firstOrFail();
    expect($nominee->is_primary)->toBeTrue();

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->put(route('financial-accounts.nominees.update', [$fixture['account'], $nominee]), [
            ...$data,
            'name' => 'Updated Nominee',
            'share_percent' => 40,
        ])
        ->assertRedirect();

    expect($nominee->fresh()->name)->toBe('Updated Nominee')
        ->and((float) $nominee->fresh()->share_percent)->toBe(40.0);

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->delete(route('financial-accounts.nominees.destroy', [$fixture['account'], $nominee]))
        ->assertRedirect();

    expect(DepositNominee::query()->whereKey($nominee->id)->exists())->toBeFalse();
});

it('rejects nominee allocations above one hundred percent', function () {
    $fixture = nomineeFixture();
    $session = ['active_organization_id' => $fixture['organization']->id];

    DepositNominee::create([
        'financial_account_id' => $fixture['account']->id,
        'name' => 'Existing Nominee',
        'relationship' => 'CHILD',
        'share_percent' => 75,
        'is_primary' => true,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->post(route('financial-accounts.nominees.store', $fixture['account']), [
            'name' => 'Second Nominee',
            'relationship' => 'CHILD',
            'share_percent' => 26,
            'is_primary' => false,
        ])
        ->assertStatus(422);
});
