<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\ShareAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantMembershipManagementPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_membership_manage_test'],
        ['name' => 'Financial Membership Manage Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.accounts.membership.manage'],
        [
            'module' => 'financial_accounts',
            'name' => 'Manage Share Memberships',
            'action' => 'manage',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function membershipFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    grantMembershipManagementPermission($user);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SHARE']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SHARE',
    ]);

    return compact('organization', 'user', 'account', 'customer');
}

it('registers and updates share membership details', function () {
    $fixture = membershipFixture();
    $session = ['active_organization_id' => $fixture['organization']->id];

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->post(route('financial-accounts.membership.store', $fixture['account']), [
            'member_since' => now()->toDateString(),
            'membership_status' => 'PENDING',
        ])
        ->assertRedirect();

    $membership = ShareAccount::query()->firstOrFail();
    expect($membership->membership_no)->toBe('MEM-' . str_pad((string) $fixture['account']->id, 8, '0', STR_PAD_LEFT));

    $this->actingAs($fixture['user'])
        ->withSession($session)
        ->put(route('financial-accounts.membership.update', [$fixture['account'], $membership]), [
            'membership_no' => 'MEM-ACTIVE-001',
            'membership_status' => 'ACTIVE',
            'member_since' => now()->subMonth()->toDateString(),
        ])
        ->assertRedirect();

    expect($membership->fresh()->membership_status)->toBe('ACTIVE')
        ->and($membership->fresh()->membership_no)->toBe('MEM-ACTIVE-001');
});

it('rejects duplicate share membership numbers', function () {
    $fixture = membershipFixture();
    ShareAccount::create([
        'financial_account_id' => $fixture['account']->id,
        'customer_id' => $fixture['customer']->id,
        'membership_no' => 'MEM-DUPLICATE',
        'membership_status' => 'ACTIVE',
    ]);
    $other = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'financial_product_id' => $fixture['account']->financial_product_id,
        'holder_type' => Customer::class,
        'holder_id' => $fixture['customer']->id,
        'account_type' => 'SHARE',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.membership.store', $other), [
            'membership_no' => 'MEM-DUPLICATE',
            'membership_status' => 'PENDING',
        ])
        ->assertStatus(422);
});
