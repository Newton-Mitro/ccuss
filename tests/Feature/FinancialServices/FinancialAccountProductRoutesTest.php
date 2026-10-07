<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\ShareAccount;
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
        'name' => 'New savings account',
        'account_type' => 'SAVINGS',
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.savings.store'), $payload)
        ->assertRedirect(route('financial-accounts.savings.show', $account = FinancialAccount::query()
            ->where('organization_id', $fixture['organization']->id)
            ->where('holder_id', $fixture['customer']->id)
            ->latest('id')
            ->firstOrFail()));

    expect($account->account_no)->toMatch('/^SAV-\d{8}$/');

    $payload['account_no'] = 'SAVINGS-WRONG-003';
    $payload['account_type'] = 'SHARE';

    $this->post(route('financial-accounts.savings.store'), $payload)
        ->assertUnprocessable();

    expect(FinancialAccount::query()->where('account_no', 'SAVINGS-WRONG-003')->exists())->toBeFalse();
});

it('generates account numbers for savings, share, fixed, and recurring deposits', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    $prefixes = [
        'SAVINGS' => 'SAV',
        'SHARE' => 'SHR',
        'FIXED_DEPOSIT' => 'FDR',
        'RECURRING_DEPOSIT' => 'RDP',
    ];

    foreach ($prefixes as $category => $prefix) {
        $product = FinancialProduct::factory()->create([
            'organization_id' => $fixture['organization']->id,
            'category' => $category,
        ]);
        $account = app(\App\FinancialServices\Application\FinancialAccountService::class)->create([
            'branch_id' => $fixture['branch']->id,
            'financial_product_id' => $product->id,
            'holder_type' => Customer::class,
            'holder_id' => $fixture['customer']->id,
            'account_type' => $category,
        ], $fixture['organization']->id);

        expect($account->account_no)->toMatch('/^' . $prefix . '-\d{8}$/')
            ->and($account->financial_product_term_id)->toBe(
                in_array($category, ['SAVINGS', 'SHARE'], true)
                ? null
                : $product->baseTerm()->value('id'),
            );
    }
});

it('enforces product multiple-account rules and active policy overrides', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    $fixture['account']->delete();
    $fixture['product']->update(['customer_can_open_multiple_account' => false]);
    $accountData = [
        'financial_product_id' => $fixture['product']->id,
        'holder_type' => Customer::class,
        'holder_id' => $fixture['customer']->id,
        'account_type' => 'SAVINGS',
    ];
    $service = app(\App\FinancialServices\Application\FinancialAccountService::class);

    $service->create($accountData, $fixture['organization']->id);
    expect(fn() => $service->create($accountData, $fixture['organization']->id))
        ->toThrow(\Illuminate\Validation\ValidationException::class, 'already has an open account');

    FinancialProductPolicy::factory()->create([
        'financial_product_id' => $fixture['product']->id,
        'customer_can_open_multiple_account' => true,
        'documentation_requirements' => null,
        'eligibility_rules' => null,
    ]);

    expect($service->create($accountData, $fixture['organization']->id))
        ->toBeInstanceOf(FinancialAccount::class);

    $fixture['product']->policy()->update(['customer_can_open_multiple_account' => false]);
    expect(fn() => $service->create($accountData, $fixture['organization']->id))
        ->toThrow(\Illuminate\Validation\ValidationException::class, 'already has an open account');
});

it('enforces the no-multiple-account product rule when the share form omits holder type', function () {
    $fixture = createFinancialAccountProductFixture('SHARE');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.create']);
    $fixture['product']->update(['customer_can_open_multiple_account' => false]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.share.store'), [
            'branch_id' => $fixture['branch']->id,
            'financial_product_id' => $fixture['product']->id,
            'holder_id' => $fixture['customer']->id,
            'account_type' => 'SHARE',
            'membership_status' => 'PENDING',
        ])
        ->assertSessionHasErrors('holder_id');

    expect(FinancialAccount::query()
        ->where('organization_id', $fixture['organization']->id)
        ->where('product_type', \App\FinancialServices\Models\DepositProduct::class)
        ->where('product_id', $fixture['product']->id)
        ->where('holder_id', $fixture['customer']->id)
        ->count())->toBe(1);
});

it('updates share membership status when a legacy account uses the holders pivot', function () {
    $fixture = createFinancialAccountProductFixture('SHARE');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.accounts.membership.manage',
    ]);
    $fixture['account']->addHolder($fixture['customer'], 'PRIMARY');
    $fixture['account']->update(['holder_type' => null]);
    $membership = ShareAccount::query()->create([
        'financial_account_id' => $fixture['account']->id,
        'membership_no' => 'MEM-SHARE-LEGACY-001',
        'membership_status' => 'PENDING',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->put(route('financial-accounts.membership.update', [
            $fixture['account'],
            $membership,
        ]), [
            'membership_status' => 'ACTIVE',
        ])
        ->assertRedirect();

    expect($membership->fresh()->membership_status)->toBe('ACTIVE');
});

it('uses the selected product term to create a recurring deposit schedule', function () {
    $fixture = createFinancialAccountProductFixture('RECURRING_DEPOSIT');
    grantFinancialAccountProductPermissions($fixture['user'], ['financial.accounts.create']);
    $term = $fixture['product']->baseTerm()->firstOrFail();
    $term->update([
        'tenure_value' => 4,
        'tenure_unit' => 'MONTH',
        'interest_rate' => 7.5,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.recurring.store'), [
            'branch_id' => $fixture['branch']->id,
            'financial_product_id' => $fixture['product']->id,
            'financial_product_term_id' => $term->id,
            'holder_type' => 'customer',
            'holder_id' => $fixture['customer']->id,
            'account_type' => 'RECURRING_DEPOSIT',
            'installment_amount' => 250,
            'installment_frequency' => 'WEEKLY',
            'total_installments' => 99,
            'started_at' => now()->toDateString(),
            'maturity_extension_days' => 0,
            'grace_days' => 0,
        ])
        ->assertRedirect(route('financial-accounts.recurring.show', $account = FinancialAccount::query()
            ->where('organization_id', $fixture['organization']->id)
            ->where('holder_id', $fixture['customer']->id)
            ->latest('id')
            ->firstOrFail()));

    expect($account->financial_product_term_id)->toBe($term->id)
        ->and($account->recurringDeposit->installment_frequency)->toBe('MONTHLY')
        ->and($account->recurringDeposit->total_installments)->toBe(4)
        ->and((float) $account->recurringDeposit->contractual_rate)->toBe(7.5);
});

it('does not expose generic financial-account creation endpoints', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get('/financial-accounts/create')
        ->assertNotFound();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post('/financial-accounts', [
            'branch_id' => $fixture['branch']->id,
            'financial_product_id' => $fixture['product']->id,
            'holder_type' => 'customer',
            'holder_id' => $fixture['customer']->id,
            'account_no' => 'LOAN-DIRECT-001',
            'name' => 'Direct loan attempt',
            'account_type' => 'LOAN',
        ])
        ->assertNotFound();

    expect(FinancialAccount::query()->where('account_no', 'LOAN-DIRECT-001')->exists())->toBeFalse();
});

it('returns a requested amount validation error above the loan product ceiling', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.loan-applications.create',
    ]);
    FinancialProductPolicy::factory()->create([
        'financial_product_id' => $fixture['product']->id,
        'maximum_loan_amount' => 1000,
        'status' => 'ACTIVE',
        'effective_from' => now()->subDay()->toDateString(),
        'documentation_requirements' => null,
        'eligibility_rules' => null,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('loan-applications.store'), [
            'customer_id' => $fixture['customer']->id,
            'financial_product_id' => $fixture['product']->id,
            'requested_amount' => 1001,
            'requested_term_months' => 12,
        ])
        ->assertSessionHasErrors('requested_amount');
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
        'name' => 'Minor savings account',
        'account_type' => 'SAVINGS',
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.savings.store'), $payload)
        ->assertSessionHasErrors('guardian_customer_id');

    expect(FinancialAccount::query()->where('holder_id', $minor->id)->exists())->toBeFalse();

    $this->post(route('financial-accounts.savings.store'), [
        ...$payload,
        'guardian_customer_id' => $guardian->id,
    ])->assertRedirect(route('financial-accounts.savings.show', $account = FinancialAccount::query()
                    ->where('holder_id', $minor->id)
                    ->latest('id')
                    ->firstOrFail()));

    expect($account->account_no)->toMatch('/^SAV-\d{8}$/');
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
    $term = $fixture['product']->baseTerm()->firstOrFail();
    $term->update([
        'tenure_value' => 18,
        'tenure_unit' => 'MONTH',
        'interest_rate' => 9.25,
        'minimum_amount' => 500,
        'maximum_amount' => 2000,
    ]);
    $payload = [
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => $fixture['product']->id,
        'holder_type' => 'customer',
        'holder_id' => $minor->id,
        'financial_product_term_id' => $term->id,
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
        'principal_amount' => 2001,
    ])->assertSessionHasErrors('principal_amount');

    $this->post(route('financial-accounts.fixed.store'), [
        ...$payload,
        'guardian_customer_id' => $guardian->id,
    ])->assertRedirect(route('financial-accounts.fixed.show', $account = FinancialAccount::query()
                    ->where('holder_id', $minor->id)
                    ->latest('id')
                    ->firstOrFail()));

    expect($account->account_no)->toMatch('/^FDR-\d{8}$/')
        ->and($account->financial_product_term_id)->toBe($term->id)
        ->and($account->fixedDeposit()->exists())->toBeTrue()
        ->and((float) $account->fixedDeposit->contractual_rate)->toBe(9.25)
        ->and($account->fixedDeposit->term_value)->toBe(18);
});
