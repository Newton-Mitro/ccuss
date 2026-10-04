<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantFinancialAccountProductPermissions(User $user, array $slugs): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_account_product_routes_test'],
        ['name' => 'Financial Account Product Routes Test'],
    );

    foreach ($slugs as $slug) {
        $permission = Permission::firstOrCreate(
            ['slug' => $slug],
            [
                'module' => 'financial_accounts',
                'name' => $slug,
                'action' => 'test',
            ],
        );
        $role->permissions()->syncWithoutDetaching([$permission->id]);
    }

    $user->roles()->syncWithoutDetaching([$role->id]);
}

function createFinancialAccountProductFixture(string $category = 'SAVINGS'): array
{
    $organization = Organization::factory()->create(['code' => 'ORG-001']);
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => $category,
    ]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => $category,
        'account_no' => strtoupper($category) . '-TEST-001',
        'balance' => 125,
    ]);

    return compact('organization', 'branch', 'user', 'customer', 'product', 'account');
}

it('serves a product-scoped index and rejects accounts of another category', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.accounts.view',
        'financial.accounts.create',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('financial-accounts.savings.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/accounts/savings/index')
            ->where('category', 'SAVINGS'));

    $this->get(route('financial-accounts.savings.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/accounts/savings/create')
            ->where('category', 'SAVINGS'));

    $this->get(route('financial-accounts.savings.show', $fixture['account']))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/accounts/savings/show')
            ->where('account.id', $fixture['account']->id));

    $this->get(route('financial-accounts.share.show', $fixture['account']))
        ->assertNotFound();
});

it('updates only the display name through a product route', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.update']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('financial-accounts.savings.edit', $fixture['account']))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/accounts/savings/edit')
            ->where('account.id', $fixture['account']->id));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->put(route('financial-accounts.savings.update', $fixture['account']), [
            'name' => 'Updated savings name',
            'balance' => 999999,
            'account_type' => 'LOAN',
            'financial_product_id' => null,
        ])
        ->assertRedirect(route('financial-accounts.savings.show', $fixture['account']));

    expect($fixture['account']->fresh()->name)->toBe('Updated savings name')
        ->and((float) $fixture['account']->fresh()->balance)->toBe(125.0)
        ->and($fixture['account']->fresh()->account_type)->toBe('SAVINGS')
        ->and($fixture['account']->fresh()->financial_product_id)->toBe($fixture['product']->id);
});

it('creates an account only when the product route, account type, and product category agree', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.create']);
    $payload = [
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => $fixture['product']->id,
        'holder_type' => 'customer',
        'holder_id' => $fixture['customer']->id,
        'account_no' => 'SAVINGS-NEW-002',
        'name' => 'New savings account',
        'account_type' => 'SAVINGS',
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.savings.store'), $payload)
        ->assertRedirect(route('financial-accounts.savings.show', FinancialAccount::query()
            ->where('account_no', 'SAVINGS-NEW-002')
            ->firstOrFail()));

    $payload['account_no'] = 'SAVINGS-WRONG-003';
    $payload['account_type'] = 'SHARE';

    $this->post(route('financial-accounts.savings.store'), $payload)
        ->assertUnprocessable();

    expect(FinancialAccount::query()->where('account_no', 'SAVINGS-WRONG-003')->exists())->toBeFalse();
});

it('does not allow direct loan account creation through the generic account endpoint', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.create']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.store'), [
            'branch_id' => $fixture['branch']->id,
            'financial_product_id' => $fixture['product']->id,
            'holder_type' => 'customer',
            'holder_id' => $fixture['customer']->id,
            'account_no' => 'LOAN-DIRECT-001',
            'name' => 'Direct loan attempt',
            'account_type' => 'LOAN',
        ])
        ->assertUnprocessable();

    expect(FinancialAccount::query()->where('account_no', 'LOAN-DIRECT-001')->exists())->toBeFalse();
});

it('requires an adult guardian when opening an account for a minor', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.create']);
    $minor = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'dob' => now()->subYears(12)->toDateString(),
    ]);
    $guardian = Customer::factory()->individualFemale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'dob' => now()->subYears(30)->toDateString(),
    ]);
    $payload = [
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => $fixture['product']->id,
        'holder_type' => 'customer',
        'holder_id' => $minor->id,
        'account_no' => 'SAVINGS-MINOR-001',
        'name' => 'Minor savings account',
        'account_type' => 'SAVINGS',
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.savings.store'), $payload)
        ->assertSessionHasErrors('guardian_customer_id');

    expect(FinancialAccount::query()->where('account_no', 'SAVINGS-MINOR-001')->exists())->toBeFalse();

    $this->post(route('financial-accounts.savings.store'), [
        ...$payload,
        'guardian_customer_id' => $guardian->id,
    ])->assertRedirect(route('financial-accounts.savings.show', FinancialAccount::query()
                    ->where('account_no', 'SAVINGS-MINOR-001')
                    ->firstOrFail()));
});

it('shows guardian validation and opens a fixed deposit for a minor with an adult guardian', function () {
    $fixture = createFinancialAccountProductFixture('FIXED_DEPOSIT');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.create']);
    $minor = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'dob' => now()->subYears(12)->toDateString(),
    ]);
    $guardian = Customer::factory()->individualFemale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'dob' => now()->subYears(30)->toDateString(),
    ]);
    $payload = [
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => $fixture['product']->id,
        'holder_type' => 'customer',
        'holder_id' => $minor->id,
        'account_no' => 'FDR-MINOR-001',
        'name' => 'Minor fixed deposit',
        'account_type' => 'FIXED_DEPOSIT',
        'principal_amount' => 1000,
        'contractual_rate' => 8,
        'term_months' => 12,
        'started_at' => now()->toDateString(),
        'maturity_instruction' => 'PAYOUT',
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.fixed.store'), $payload)
        ->assertSessionHasErrors('guardian_customer_id');

    $this->post(route('financial-accounts.fixed.store'), [
        ...$payload,
        'guardian_customer_id' => $guardian->id,
    ])->assertRedirect(route('financial-accounts.fixed.show', FinancialAccount::query()
                    ->where('account_no', 'FDR-MINOR-001')
                    ->firstOrFail()));

    expect(FinancialAccount::query()
        ->where('account_no', 'FDR-MINOR-001')
        ->firstOrFail()
        ->fixedDeposit()
        ->exists())->toBeTrue();
});
