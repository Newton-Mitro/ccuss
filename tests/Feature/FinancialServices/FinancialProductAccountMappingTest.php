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

function grantProductViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_product_view_test'],
        ['name' => 'Financial Product View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.products.view'],
        [
            'module' => 'financial_products',
            'name' => 'View Financial Products',
            'action' => 'view',
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

it('lists organization mappings with search, status, and product filters', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantProductViewPermission($user);

    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'code' => 'SAV-001',
        'name' => 'Savings Product',
    ]);
    $debit = LedgerAccount::factory()->create(['organization_id' => $organization->id]);
    $credit = LedgerAccount::factory()->create(['organization_id' => $organization->id]);
    $product->accountMappings()->create([
        'transaction_type' => 'DEPOSIT',
        'debit_account_id' => $debit->id,
        'credit_account_id' => $credit->id,
        'status' => true,
    ]);
    $product->accountMappings()->create([
        'transaction_type' => 'WITHDRAWAL',
        'status' => false,
    ]);
    $foreignProduct = FinancialProduct::factory()->create(['organization_id' => $otherOrganization->id]);
    $foreignProduct->accountMappings()->create(['transaction_type' => 'DEPOSIT']);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-product-account-mappings.index', [
            'search' => 'DEPOSIT',
            'status' => 'active',
            'per_page' => 1,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/product-account-mappings/index')
            ->where('mappings.total', 1)
            ->where('mappings.per_page', 1)
            ->where('mappings.data.0.product.id', $product->id)
            ->where('mappings.data.0.transaction_type', 'DEPOSIT')
            ->where('filters.search', 'DEPOSIT')
            ->where('filters.status', 'active'));
});
