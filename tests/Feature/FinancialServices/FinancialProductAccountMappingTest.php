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
    grantProductViewPermission($user);
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

    $this->assertDatabaseHas('gl_account_mappings', [
        'source_type' => 'FINANCIAL_PRODUCT',
        'source_code' => (string) $product->id,
        'financial_product_id' => $product->id,
        'transaction_type' => 'DEPOSIT',
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-products.show', $product))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/products/show')
            ->where('product.account_mappings.0.transaction_type', 'DEPOSIT')
            ->has('ledgerAccounts', 2));
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

it('allows authorized users to edit system products and their terms', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $role = Role::firstOrCreate(
        ['slug' => 'financial_product_update_system_test'],
        ['name' => 'Financial Product System Update Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.products.update'],
        ['module' => 'financial_products', 'name' => 'Update Products', 'action' => 'update'],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'is_system' => true,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-products.edit', $product))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/products/form')
            ->where('product.id', $product->id));

    $this->put(route('financial-products.update', $product), [
        'code' => $product->code,
        'name' => $product->name,
        'category' => $product->category,
        'balance_type' => $product->balance_type,
        'interest_calculation' => $product->interest_calculation,
        'interest_frequency' => $product->interest_frequency,
        'status' => true,
        'customer_can_open_multiple_account' => true,
        'terms' => [
            [
                'id' => $product->baseTerm->id,
                'code' => 'BASE',
                'name' => 'Updated system base term',
                'tenure_value' => 18,
                'tenure_unit' => 'MONTH',
                'interest_rate' => 8.75,
                'interest_calculation' => 'SIMPLE',
                'interest_frequency' => 'MONTHLY',
                'status' => true,
            ]
        ],
    ])->assertRedirect(route('financial-products.index'));

    expect($product->fresh()->is_system)->toBeTrue()
        ->and($product->baseTerm()->first()->name)->toBe('Updated system base term')
        ->and((float) $product->baseTerm()->first()->interest_rate)->toBe(8.75);
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
