<?php

use App\FinancialServices\Models\FinancialProduct;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantProductMappingPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_product_mapping_test'],
        ['name' => 'Financial Product Mapping Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.products.mappings.manage'],
        [
            'module' => 'financial_products',
            'name' => 'Manage Product Account Mappings',
            'action' => 'manage',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('creates and rejects duplicate product account mappings', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantProductMappingPermission($user);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id]);
    $debit = LedgerAccount::factory()->create(['organization_id' => $organization->id]);
    $credit = LedgerAccount::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('financial-products.account-mappings.store', $product), [
            'transaction_type' => 'DEPOSIT',
            'debit_account_id' => $debit->id,
            'credit_account_id' => $credit->id,
            'status' => true,
        ])
        ->assertRedirect();

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('financial-products.account-mappings.store', $product), [
            'transaction_type' => 'DEPOSIT',
            'debit_account_id' => $debit->id,
            'credit_account_id' => $credit->id,
            'status' => true,
        ])
        ->assertSessionHasErrors('transaction_type');

    $this->assertDatabaseHas('financial_product_account_mappings', [
        'financial_product_id' => $product->id,
        'transaction_type' => 'DEPOSIT',
    ]);
});

it('rejects ledger accounts from another organization', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantProductMappingPermission($user);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id]);
    $foreignAccount = LedgerAccount::factory()->create(['organization_id' => $otherOrganization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('financial-products.account-mappings.store', $product), [
            'transaction_type' => 'WITHDRAWAL',
            'debit_account_id' => $foreignAccount->id,
        ])
        ->assertSessionHasErrors('debit_account_id');
});
