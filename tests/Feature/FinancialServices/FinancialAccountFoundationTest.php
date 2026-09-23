<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\DepositNominee;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\ShareAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantFinancialAccountViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_accounts_view_test'],
        ['name' => 'Financial Accounts View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.accounts.view'],
        [
            'module' => 'financial_accounts',
            'name' => 'View Financial Accounts',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('loads unified account subtype data on the account detail page', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantFinancialAccountViewPermission($user);

    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SHARE',
    ]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SHARE',
    ]);
    $account->addHolder($customer, 'PRIMARY');
    ShareAccount::create([
        'financial_account_id' => $account->id,
        'customer_id' => $customer->id,
        'member_since' => now()->toDateString(),
        'membership_no' => 'MEM-0001',
        'membership_status' => 'ACTIVE',
    ]);
    DepositNominee::create([
        'financial_account_id' => $account->id,
        'name' => 'Nominee One',
        'relationship' => 'SPOUSE',
        'share_percent' => 100,
        'is_primary' => true,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-accounts.show', $account))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/accounts/show')
            ->where('account.id', $account->id)
            ->where('account.account_type', 'SHARE')
            ->has('account.holders', 1)
            ->where('account.holders.0.id', $customer->id)
            ->where('account.share_account.membership_no', 'MEM-0001')
            ->where('account.nominees.0.name', 'Nominee One'));
});

it('assigns a primary holder when opening a share account', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SHARE',
    ]);

    $account = app(\App\FinancialServices\Application\FinancialAccountService::class)->create([
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'SHARE-0001',
        'account_type' => 'SHARE',
    ], $organization->id);

    expect($account->holders()->whereKey($customer->id)->exists())->toBeTrue();
});
