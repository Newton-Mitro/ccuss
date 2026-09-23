<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\RecurringDepositService;
use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\RecurringDeposit;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantRecurringDepositManagementPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'financial_recurring_deposits_manage_test'],
        ['name' => 'Financial Recurring Deposits Manage Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'financial.accounts.recurring-deposits.manage'],
        [
            'module' => 'financial_accounts',
            'name' => 'Manage Recurring Deposits',
            'action' => 'manage',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function recurringDepositFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    grantRecurringDepositManagementPermission($user);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'RECURRING_DEPOSIT']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'RECURRING_DEPOSIT',
    ]);

    return compact('organization', 'user', 'account');
}

it('generates a recurring-deposit schedule with month-end-safe dates', function () {
    $fixture = recurringDepositFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('financial-accounts.recurring-deposit.store', $fixture['account']), [
            'installment_amount' => 500,
            'installment_frequency' => 'MONTHLY',
            'total_installments' => 3,
            'started_at' => '2026-01-31',
            'maturity_extension_days' => 5,
            'grace_days' => 2,
        ])
        ->assertRedirect();

    $contract = RecurringDeposit::query()->with('installments')->firstOrFail();
    expect($contract->installments)->toHaveCount(3)
        ->and($contract->installments[0]->due_date->toDateString())->toBe('2026-01-31')
        ->and($contract->installments[1]->due_date->toDateString())->toBe('2026-02-28')
        ->and($contract->installments[2]->due_date->toDateString())->toBe('2026-03-31')
        ->and($contract->maturity_date->toDateString())->toBe('2026-04-05');
});

it('rejects a second recurring-deposit contract for the same account', function () {
    $fixture = recurringDepositFixture();
    $service = app(RecurringDepositService::class);
    $service->open($fixture['account'], [
        'installment_amount' => 100,
        'installment_frequency' => 'WEEKLY',
        'total_installments' => 4,
        'started_at' => '2026-01-01',
        'maturity_extension_days' => 0,
        'grace_days' => 0,
    ]);

    expect(fn() => $service->open($fixture['account'], [
        'installment_amount' => 100,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 2,
        'started_at' => '2026-02-01',
    ]))->toThrow(RuntimeException::class, 'already has');
});

it('supports missed and waived installment transitions with due-date guards', function () {
    $fixture = recurringDepositFixture();
    $service = app(RecurringDepositService::class);
    $contract = $service->open($fixture['account'], [
        'installment_amount' => 100,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 3,
        'started_at' => now()->subMonth()->toDateString(),
        'maturity_extension_days' => 0,
        'grace_days' => 0,
    ]);
    $pastInstallment = $contract->installments->first();
    $futureInstallment = $contract->installments->last();

    expect(fn() => $service->markMissed($contract, $futureInstallment))
        ->toThrow(RuntimeException::class, 'due pending');

    expect($service->markMissed($contract, $pastInstallment)->status)->toBe('MISSED')
        ->and($service->waive($contract, $pastInstallment)->status)->toBe('WAIVED');
});

it('links installment payments and marks them paid only after posting', function () {
    $fixture = recurringDepositFixture();
    $service = app(RecurringDepositService::class);
    $transactionService = app(FinancialTransactionService::class);
    $contract = $service->open($fixture['account'], [
        'installment_amount' => 100,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 1,
        'started_at' => now()->toDateString(),
    ]);
    $installment = $contract->installments->first();

    $transaction = $service->collectPayment($contract, $installment, [
        'amount' => 100,
        'transaction_date' => now()->toDateString(),
        'idempotency_key' => (string) \Illuminate\Support\Str::uuid(),
    ], $fixture['organization']->id, $fixture['user']->id);

    expect($installment->fresh()->financial_transaction_id)->toBe($transaction->id)
        ->and($installment->fresh()->status)->toBe('PENDING');

    $transactionService->post($transaction, $fixture['organization']->id, $fixture['user']->id);

    expect($installment->fresh()->status)->toBe('PAID')
        ->and((float) $fixture['account']->fresh()->balance)->toBe(100.0);
});
