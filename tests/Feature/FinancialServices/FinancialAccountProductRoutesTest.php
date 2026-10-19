<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Application\LoanApplicationService;
use App\FinancialServices\Application\LoanProtectionClaimService;
use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\ShareAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

it('activates pending savings, share, fixed, and recurring accounts only with update permission', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.accounts.update',
    ]);
    $categories = [
        'savings' => 'SAVINGS',
        'share' => 'SHARE',
        'fixed' => 'FIXED_DEPOSIT',
        'recurring' => 'RECURRING_DEPOSIT',
    ];

    foreach ($categories as $routeProduct => $category) {
        $product = DepositProduct::factory()->create([
            'organization_id' => $fixture['organization']->id,
            'category' => $category,
        ]);
        $account = FinancialAccount::factory()->create([
            'organization_id' => $fixture['organization']->id,
            'branch_id' => $fixture['branch']->id,
            'product_type' => DepositProduct::class,
            'product_id' => $product->id,
            'holder_type' => Customer::class,
            'holder_id' => $fixture['customer']->id,
            'account_type' => $category,
            'account_no' => "{$routeProduct}-ACTIVATION-001",
            'status' => 'PENDING',
            'opened_at' => null,
        ]);

        $this->actingAs($fixture['user'])
            ->withSession(['active_organization_id' => $fixture['organization']->id])
            ->post(route('financial-accounts.activate', $account))
            ->assertRedirect();

        expect($account->fresh()->status)->toBe('ACTIVE')
            ->and($account->fresh()->opened_at->toDateString())->toBe(now()->toDateString());

        $this->post(route('financial-accounts.activate', $account))
            ->assertSessionHasErrors('status');
    }
});

it('does not allow account activation without update permission', function () {
    $fixture = createFinancialAccountProductFixture('SAVINGS');
    $fixture['account']->update(['status' => 'PENDING']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.activate', $fixture['account']))
        ->assertForbidden();

    expect($fixture['account']->fresh()->status)->toBe('PENDING');
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

it('updates savings rules through the product edit route', function () {
    $savings = createFinancialAccountProductFixture('SAVINGS');
    $savings['account']->savingAccount()->create(['minimum_balance' => 25]);
    grantFinancialAccountProductPermissions($savings['user'], ['financial.accounts.update']);

    $this->actingAs($savings['user'])
        ->withSession(['active_organization_id' => $savings['organization']->id])
        ->put(route('financial-accounts.savings.update', $savings['account']), [
            'name' => 'Updated savings',
            'minimum_balance' => '75.50',
        ])
        ->assertRedirect(route('financial-accounts.savings.show', $savings['account']));

    expect((float) $savings['account']->savingAccount()->value('minimum_balance'))->toBe(75.5);
});

it('updates share membership details through the product edit route', function () {
    $share = createFinancialAccountProductFixture('SHARE');
    $membership = $share['account']->shareAccount()->create([
        'membership_no' => 'MEM-ORIGINAL',
        'member_since' => '2020-01-01',
        'membership_status' => 'PENDING',
    ]);
    grantFinancialAccountProductPermissions($share['user'], [
        'financial.accounts.update',
        'financial.accounts.membership.manage',
    ]);

    $this->actingAs($share['user'])
        ->withSession(['active_organization_id' => $share['organization']->id])
        ->put(route('financial-accounts.share.update', $share['account']), [
            'name' => 'Updated member account',
            'membership_no' => 'MEM-UPDATED',
            'member_since' => '2021-02-03',
            'membership_status' => 'ACTIVE',
        ])
        ->assertRedirect(route('financial-accounts.share.show', $share['account']));

    expect($membership->fresh()->membership_no)->toBe('MEM-UPDATED')
        ->and($membership->fresh()->member_since->toDateString())->toBe('2021-02-03')
        ->and($membership->fresh()->membership_status)->toBe('ACTIVE');
});

it('requires membership-management permission to edit membership details', function () {
    $share = createFinancialAccountProductFixture('SHARE');
    $share['account']->shareAccount()->create([
        'membership_no' => 'MEM-ORIGINAL',
        'membership_status' => 'PENDING',
    ]);
    grantFinancialAccountProductPermissions($share['user'], ['financial.accounts.update']);

    $this->actingAs($share['user'])
        ->withSession(['active_organization_id' => $share['organization']->id])
        ->put(route('financial-accounts.share.update', $share['account']), [
            'membership_no' => 'MEM-UNAUTHORIZED',
            'membership_status' => 'ACTIVE',
        ])
        ->assertForbidden();
});

it('updates fixed-deposit contract terms and recalculates maturity values', function () {
    $fixture = createFinancialAccountProductFixture('FIXED_DEPOSIT');
    $deposit = $fixture['account']->fixedDeposit()->create([
        'principal_amount' => 1000,
        'contractual_rate' => 10,
        'term_value' => 12,
        'term_unit' => 'MONTH',
        'started_at' => '2024-01-01',
        'maturity_date' => '2025-01-01',
        'maturity_amount' => 1100,
        'maturity_instruction' => 'PAYOUT',
    ]);
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.accounts.update',
        'financial.accounts.fixed-deposits.manage',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->put(route('financial-accounts.fixed.update', $fixture['account']), [
            'name' => 'Updated fixed deposit',
            'principal_amount' => '2000',
            'contractual_rate' => '12',
            'term_value' => '6',
            'term_unit' => 'MONTH',
            'started_at' => '2024-01-01',
            'maturity_instruction' => 'RENEW_PRINCIPAL',
        ])
        ->assertRedirect(route('financial-accounts.fixed.show', $fixture['account']));

    expect((float) $deposit->fresh()->principal_amount)->toBe(2000.0)
        ->and($deposit->fresh()->maturity_date->toDateString())->toBe('2024-07-01')
        ->and((float) $deposit->fresh()->maturity_amount)->toBe(2120.0)
        ->and($deposit->fresh()->maturity_instruction)->toBe('RENEW_PRINCIPAL');
});

it('updates recurring schedules only before installment history exists', function () {
    $fixture = createFinancialAccountProductFixture('RECURRING_DEPOSIT');
    $deposit = $fixture['account']->recurringDeposit()->create([
        'installment_amount' => 100,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 2,
        'paid_installments' => 0,
        'started_at' => '2024-01-01',
        'maturity_date' => '2024-02-01',
        'maturity_extension_days' => 0,
        'grace_days' => 0,
    ]);
    $deposit->installments()->createMany([
        ['installment_no' => 1, 'due_date' => '2024-01-01', 'amount_due' => 100, 'status' => 'PENDING'],
        ['installment_no' => 2, 'due_date' => '2024-02-01', 'amount_due' => 100, 'status' => 'PENDING'],
    ]);
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.accounts.update',
        'financial.accounts.recurring-deposits.manage',
    ]);

    $payload = [
        'name' => 'Updated recurring deposit',
        'installment_amount' => '200',
        'installment_frequency' => 'WEEKLY',
        'total_installments' => '3',
        'started_at' => '2024-01-10',
        'maturity_extension_days' => '2',
        'grace_days' => '4',
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->put(route('financial-accounts.recurring.update', $fixture['account']), $payload)
        ->assertRedirect(route('financial-accounts.recurring.show', $fixture['account']));

    expect((int) $deposit->fresh()->total_installments)->toBe(3)
        ->and($deposit->fresh()->maturity_date->toDateString())->toBe('2024-01-26')
        ->and($deposit->installments()->count())->toBe(3)
        ->and((float) $deposit->installments()->first()->amount_due)->toBe(200.0);

    $deposit->installments()->first()->update([
        'status' => 'PAID',
        'amount_paid' => 200,
    ]);
    $payload['installment_amount'] = '250';

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->put(route('financial-accounts.recurring.update', $fixture['account']), $payload)
        ->assertSessionHasErrors('installment_amount');

    expect((float) $deposit->fresh()->installment_amount)->toBe(200.0)
        ->and($deposit->installments()->count())->toBe(3);
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

it('does not allow additional holders or authorized persons on loan accounts', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.accounts.holders.manage',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.holders.store', $fixture['account']), [
            'customer_id' => $fixture['customer']->id,
            'role' => 'JOINT',
            'ownership_percent' => 50,
        ])
        ->assertUnprocessable();

    $this->post(route('financial-accounts.authorized-persons.store', $fixture['account']), [
        'customer_id' => $fixture['customer']->id,
        'authorization_type' => 'SIGNATORY',
        'is_active' => true,
    ])->assertUnprocessable();
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

it('creates a credit-life product and allows it to be selected for a loan application', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.loan-protection-products.view',
        'financial.loan-protection-products.manage',
        'financial.loan-applications.view',
        'financial.loan-applications.create',
        'financial.loan-applications.update',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('loan-protection-products.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/loan-protection-products/index')
            ->has('products.data', 0)
            ->where('can_manage', true));

    $this->get(route('loan-protection-products.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/loan-protection-products/form')
            ->where('product', null));

    $this->post(route('loan-protection-products.store'), [
        'code' => 'CL-1PCT',
        'name' => 'Credit life 1 percent',
        'description' => 'Monthly cover against outstanding loan principal.',
        'monthly_rate_percent' => 1,
        'status' => true,
    ])->assertRedirect(route('loan-protection-products.index'));

    $protectionProduct = \App\FinancialServices\Models\LoanProtectionProduct::query()->firstOrFail();
    $this->get(route('loan-protection-products.index', ['search' => 'CL-1PCT']))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.code', 'CL-1PCT')
            ->where('filters.search', 'CL-1PCT'));

    $this->get(route('loan-protection-products.index', ['search' => 'missing']))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->has('products.data', 0));

    $this->get(route('loan-protection-products.edit', $protectionProduct))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/loan-protection-products/form')
            ->where('product.id', $protectionProduct->id)
            ->where('product.code', 'CL-1PCT'));

    $this->put(route('loan-protection-products.update', $protectionProduct), [
        'code' => 'CL-1PCT',
        'name' => 'Credit life 1 percent updated',
        'description' => 'Monthly cover against outstanding loan principal.',
        'monthly_rate_percent' => 1.25,
        'status' => true,
    ])->assertRedirect(route('loan-protection-products.index'));

    $protectionProduct->refresh();
    expect($protectionProduct->name)->toBe('Credit life 1 percent updated');

    $this->post(route('loan-applications.store'), [
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'loan_protection_product_id' => $protectionProduct->id,
        'requested_amount' => 500,
        'requested_term_months' => 12,
    ])->assertRedirect();

    $application = \App\FinancialServices\Models\LoanApplication::query()->latest('id')->firstOrFail();
    expect($application->loan_protection_product_id)->toBe($protectionProduct->id);

    $this->get(route('loan-applications.edit', $application))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/loan-applications/form')
            ->where('application.loan_protection_product_id', $protectionProduct->id)
            ->where('protectionProducts.0.id', $protectionProduct->id));

    $protectionProduct->update(['status' => false]);
    $this->put(route('loan-applications.update', $application), [
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'loan_protection_product_id' => $protectionProduct->id,
        'requested_amount' => 500,
        'requested_term_months' => 12,
    ])->assertRedirect();
});

it('submits and approves a death claim then settles the loan through a posted ledger transaction', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.loan-applications.view',
        'financial.loan-applications.create',
        'financial.loan-applications.manage',
        'financial.loan-applications.documents.view',
    ]);
    Storage::fake('local');
    $protectionProduct = \App\FinancialServices\Models\LoanProtectionProduct::query()->create([
        'organization_id' => $fixture['organization']->id,
        'code' => 'CL-CLAIM',
        'name' => 'Credit life claim test',
        'monthly_rate_percent' => 0.5,
        'status' => true,
    ]);
    $applicationService = app(LoanApplicationService::class);
    $application = $applicationService->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'loan_protection_product_id' => $protectionProduct->id,
        'requested_amount' => 500,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);
    $applicationService->submit($application);
    $applicationService->approve($application, [], $fixture['user']->id);
    $loan = $applicationService->createLoanAccount($application->fresh());
    $loan->update(['disbursed_amount' => 500, 'status' => 'ACTIVE']);
    $loan->financialAccount()->update(['balance' => 500, 'available_balance' => 500]);
    app(LoanScheduleService::class)->generate($loan, [
        'frequency' => 'MONTHLY',
        'start_date' => now()->toDateString(),
    ]);
    $payoutAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'balance' => 0,
        'available_balance' => 0,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('loan-applications.protection-claims.store', $application), [
            'death_date' => now()->subMonth()->toDateString(),
            'death_certificate' => UploadedFile::fake()->create('death.pdf', 50, 'application/pdf'),
            'notes' => 'Claim documentation received',
        ])
        ->assertRedirect();

    $claim = \App\FinancialServices\Models\LoanProtectionClaim::query()->firstOrFail();
    $this->get(route('loan-applications.protection-claims.certificate', [$application, $claim]))
        ->assertSuccessful()
        ->assertDownload('death.pdf');

    $this->post(route('loan-applications.protection-claims.approve', [$application, $claim]), [
        'payout_account_id' => $payoutAccount->id,
        'decision_note' => 'Death certificate verified',
    ])->assertRedirect();

    $claim->refresh();
    $transaction = \App\FinancialServices\Models\FinancialTransaction::query()->findOrFail($claim->financial_transaction_id);
    expect($claim->status)->toBe('APPROVED')
        ->and((float) $claim->payout_amount)->toBe(500.0)
        ->and($transaction->status)->toBe('PENDING');

    app(FinancialTransactionService::class)->post($transaction, $fixture['organization']->id, $fixture['user']->id);

    expect($claim->fresh()->status)->toBe('SETTLED')
        ->and($loan->fresh()->status)->toBe('CLOSED')
        ->and($loan->financialAccount->fresh()->status)->toBe('CLOSED')
        ->and($loan->protectionPolicy()->first()->status)->toBe('CANCELLED');
});

it('searches loan applications and exposes draft edit access to permitted users', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.loan-applications.view',
        'financial.loan-applications.create',
        'financial.loan-applications.update',
    ]);
    $payload = [
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 500,
        'requested_term_months' => 12,
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('loan-applications.store'), $payload)
        ->assertRedirect();
    $this->post(route('loan-applications.store'), $payload)->assertRedirect();

    $this->get(route('loan-applications.index', [
        'search' => 'LA-000001',
        'status' => 'DRAFT',
        'per_page' => 1,
    ]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/loan-applications/index')
            ->where('can_update', true)
            ->where('filters.search', 'LA-000001')
            ->has('applications.data', 1)
            ->where('applications.data.0.application_no', 'LA-000001'));
});

it('saves loan application details and private supporting documents with the draft', function () {
    $fixture = createFinancialAccountProductFixture('LOAN');
    grantFinancialAccountProductPermissions($fixture['user'], [
        'financial.loan-applications.create',
        'financial.loan-applications.update',
        'financial.loan-applications.view',
        'financial.loan-applications.documents.view',
    ]);
    Storage::fake('local');

    $payload = [
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 500,
        'requested_term_months' => 12,
        'income_details' => [['source' => 'Salary', 'monthly_amount' => 3200]],
        'expense_details' => [['category' => 'Housing', 'monthly_amount' => 900]],
        'job_histories' => [['employer_name' => 'Northwind', 'job_title' => 'Clerk', 'is_current' => true]],
        'asset_details' => [['asset_type' => 'Vehicle', 'description' => '2019 sedan', 'estimated_value' => 8000]],
        'educations' => [['institution_name' => 'Central College', 'qualification' => 'Diploma']],
        'supporting_documents' => [
            [
                'document_type' => 'INCOME',
                'file' => UploadedFile::fake()->create('income.pdf', 30, 'application/pdf'),
            ]
        ],
    ];

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('loan-applications.store'), $payload)
        ->assertRedirect();

    $application = \App\FinancialServices\Models\LoanApplication::query()->latest('id')->firstOrFail();
    $document = \App\FinancialServices\Models\LoanApplicationSupportingDocument::query()->firstOrFail();

    expect($application->incomeDetails()->count())->toBe(1)
        ->and($application->expenseDetails()->count())->toBe(1)
        ->and($application->jobHistories()->count())->toBe(1)
        ->and($application->assetDetails()->count())->toBe(1)
        ->and($application->educations()->count())->toBe(1)
        ->and($document->loan_application_id)->toBe($application->id);
    Storage::disk('local')->assertExists($document->file_path);

    $this->get(route('loan-applications.show', $application))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/loan-applications/show')
            ->where('application.income_details.0.source', 'Salary')
            ->where('application.supporting_documents.0.file_name', 'income.pdf'));

    $this->get(route('loan-applications.documents.download', [$application, $document]))
        ->assertSuccessful()
        ->assertDownload('income.pdf');

    $documentPermission = Permission::query()
        ->where('slug', 'financial.loan-applications.documents.view')
        ->firstOrFail();
    $viewPermission = Permission::query()
        ->where('slug', 'financial.loan-applications.view')
        ->firstOrFail();
    $viewerRole = Role::firstOrCreate(
        ['slug' => 'loan_application_view_only_test'],
        ['name' => 'Loan Application View Only Test'],
    );
    $viewerRole->permissions()->sync([$viewPermission->id]);
    $viewer = User::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $viewer->roles()->attach($viewerRole->id);

    $this->actingAs($viewer)
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('loan-applications.documents.download', [$application, $document]))
        ->assertForbidden();
    $this->get(route('loan-applications.show', $application))
        ->assertInertia(fn($page) => $page
            ->where('can_view_supporting_documents', false)
            ->missing('application.supporting_documents'));

    $this->actingAs($fixture['user']);
    unset($payload['supporting_documents']);
    $payload['income_details'] = [['source' => 'Consulting', 'monthly_amount' => 700]];
    $payload['supporting_documents'] = [
        [
            'document_type' => 'BANK_STATEMENT',
            'file' => UploadedFile::fake()->create('bank.pdf', 20, 'application/pdf'),
        ]
    ];
    $payload['_method'] = 'put';
    $this->post(route('loan-applications.update', $application), $payload)->assertRedirect();

    expect($application->refresh()->incomeDetails()->count())->toBe(1)
        ->and($application->incomeDetails()->first()->source)->toBe('Consulting')
        ->and($application->supportingDocuments()->count())->toBe(2);
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
