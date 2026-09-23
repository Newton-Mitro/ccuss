<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FixedDepositService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FixedDeposit;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantFixedDepositManagementPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_fixed_deposits_manage_test'],
        ['name' => 'Financial Fixed Deposits Manage Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.accounts.fixed-deposits.manage'],
        [
            'module' => 'financial_accounts',
            'name' => 'Manage Fixed Deposits',
            'action' => 'manage',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function fixedDepositFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    grantFixedDepositManagementPermission($user);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'FIXED_DEPOSIT']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'FIXED_DEPOSIT',
    ]);

    return compact('organization', 'user', 'account');
}

it('opens a fixed-deposit contract and calculates simple maturity', function () {
    $fixture = fixedDepositFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.fixed-deposit.store', $fixture['account']), [
            'principal_amount' => 1000,
            'contractual_rate' => 10,
            'term_months' => 12,
            'started_at' => '2026-01-31',
            'maturity_instruction' => 'PAYOUT',
        ])
        ->assertRedirect();

    $contract = FixedDeposit::query()->firstOrFail();
    expect((float) $contract->maturity_amount)->toBe(1100.0)
        ->and($contract->maturity_date->toDateString())->toBe('2027-01-31')
        ->and($contract->status)->toBe('ACTIVE');
});

it('rejects a second fixed-deposit contract for the same account', function () {
    $fixture = fixedDepositFixture();
    $service = app(FixedDepositService::class);
    $service->open($fixture['account'], [
        'principal_amount' => 1000,
        'contractual_rate' => 10,
        'term_months' => 12,
        'started_at' => '2026-01-01',
        'maturity_instruction' => 'PAYOUT',
    ]);

    expect(fn() => $service->open($fixture['account'], [
        'principal_amount' => 500,
        'contractual_rate' => 8,
        'term_months' => 6,
        'started_at' => '2026-02-01',
        'maturity_instruction' => 'PAYOUT',
    ]))->toThrow(RuntimeException::class, 'already has');
});
