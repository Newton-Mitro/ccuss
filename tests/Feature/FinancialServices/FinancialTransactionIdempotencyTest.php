<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Application\DefaultFineService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\AccountDefaultEvent;
use App\FinancialServices\Models\AccountDefaultRule;
use App\FinancialServices\Models\AccountFine;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanDisbursement;
use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use Illuminate\Support\Str;

it('returns the original draft when a transaction is retried with the same idempotency key', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $data = [
        'financial_account_id' => $account->id,
        'transaction_type' => 'WITHDRAWAL',
        'transaction_date' => now()->toDateString(),
        'amount' => 25,
        'idempotency_key' => (string) Str::uuid(),
    ];
    $service = app(FinancialTransactionService::class);

    $first = $service->create($data, $organization->id, $user->id);
    $retry = $service->create($data, $organization->id, $user->id);

    expect($retry->id)->toBe($first->id)
        ->and(FinancialTransaction::query()->where('organization_id', $organization->id)->count())->toBe(1);
});

it('rejects an idempotency key reused for a different transaction', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $key = (string) Str::uuid();
    $service = app(FinancialTransactionService::class);
    $service->create([
        'financial_account_id' => $account->id,
        'transaction_type' => 'WITHDRAWAL',
        'transaction_date' => now()->toDateString(),
        'amount' => 25,
        'idempotency_key' => $key,
    ], $organization->id, $user->id);

    expect(fn() => $service->create([
        'financial_account_id' => $account->id,
        'transaction_type' => 'WITHDRAWAL',
        'transaction_date' => now()->toDateString(),
        'amount' => 50,
        'idempotency_key' => $key,
    ], $organization->id, $user->id))->toThrow(RuntimeException::class, 'different transaction');
});

it('reuses a transfer draft only when both account entries match', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
        'balance_type' => 'LIABILITY',
    ]);
    $source = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $destination = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $key = (string) Str::uuid();
    $service = app(FinancialTransactionService::class);
    $data = [
        'source_account_id' => $source->id,
        'destination_account_id' => $destination->id,
        'transaction_date' => now()->toDateString(),
        'amount' => 25,
        'idempotency_key' => $key,
    ];

    $first = $service->createTransfer($data, $organization->id, $user->id);
    $retry = $service->createTransfer($data, $organization->id, $user->id);

    expect($retry->id)->toBe($first->id)
        ->and(FinancialTransaction::query()->where('organization_id', $organization->id)->count())->toBe(1);
});

it('does not duplicate the loan disbursement record when a draft is retried', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => now()->toDateString(),
        'status' => BranchDay::STATUS_OPEN,
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $loanProduct = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'LOAN',
        'balance_type' => 'ASSET',
    ]);
    $loanFinancialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $loanProduct->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'LOAN',
    ]);
    $payoutAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'balance' => 1000,
        'available_balance' => 1000,
    ]);
    $loan = LoanAccount::create([
        'customer_id' => $customer->id,
        'financial_account_id' => $loanFinancialAccount->id,
        'financial_product_id' => $loanProduct->id,
        'loan_no' => 'LOAN-IDEMPOTENCY-001',
        'principal_amount' => 1000,
        'disbursed_amount' => 0,
        'contractual_rate' => 10,
        'interest_calculation' => 'SIMPLE',
        'term_months' => 12,
        'status' => 'APPROVED',
    ]);
    $service = app(FinancialTransactionService::class);
    $data = [
        'loan_account_id' => $loan->id,
        'payout_account_id' => $payoutAccount->id,
        'amount' => 250,
        'disbursed_at' => now()->toDateString(),
        'idempotency_key' => (string) Str::uuid(),
    ];

    $first = $service->createLoanDisbursement($data, $organization->id, $user->id);
    $retry = $service->createLoanDisbursement($data, $organization->id, $user->id);

    expect($retry->id)->toBe($first->id)
        ->and(LoanDisbursement::query()->where('loan_account_id', $loan->id)->count())->toBe(1);

    $service->post($first, $organization->id, $user->id);
    $service->reverse($first->fresh(), $organization->id);

    expect($loan->fresh()->disbursed_amount)->toBe('0.0000')
        ->and($loan->fresh()->status)->toBe('APPROVED')
        ->and(LoanDisbursement::query()->where('loan_account_id', $loan->id)->value('status'))->toBe('CANCELLED');
});

it('allocates, posts, and reverses a loan repayment idempotently', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => now()->toDateString(),
        'status' => BranchDay::STATUS_OPEN,
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $loanProduct = FinancialProduct::factory()->loan()->create([
        'organization_id' => $organization->id,
        'interest_rate' => 0,
    ]);
    $loanFinancialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $loanProduct->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'LOAN',
        'balance' => 1000,
        'available_balance' => 1000,
    ]);
    $payoutAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'CASH',
    ]);
    $loan = LoanAccount::create([
        'customer_id' => $customer->id,
        'financial_account_id' => $loanFinancialAccount->id,
        'financial_product_id' => $loanProduct->id,
        'loan_no' => 'LOAN-REPAYMENT-001',
        'principal_amount' => 1000,
        'disbursed_amount' => 1000,
        'contractual_rate' => 0,
        'interest_calculation' => 'SIMPLE',
        'term_months' => 1,
        'status' => 'ACTIVE',
    ]);
    app(LoanScheduleService::class)->generate($loan, ['frequency' => 'MONTHLY', 'start_date' => now()->subMonth()->toDateString()]);
    $service = app(FinancialTransactionService::class);
    $data = [
        'loan_account_id' => $loan->id,
        'payout_account_id' => $payoutAccount->id,
        'amount' => 1000,
        'repayment_date' => now()->toDateString(),
        'idempotency_key' => (string) Str::uuid(),
    ];

    $first = $service->createLoanRepayment($data, $organization->id, $user->id);
    $retry = $service->createLoanRepayment($data, $organization->id, $user->id);
    $service->post($first, $organization->id, $user->id);

    expect($retry->id)->toBe($first->id)
        ->and($loan->schedules()->first()->fresh()->status)->toBe('PAID')
        ->and($loan->repayments()->first()->fresh()->status)->toBe('POSTED');

    $service->reverse($first->fresh(), $organization->id);

    expect($loan->schedules()->first()->fresh()->status)->toBe('PENDING')
        ->and($loan->repayments()->first()->fresh()->status)->toBe('REVERSED');
});

it('posts and reverses a fine payment while preserving the fine balance', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
        'balance_type' => 'LIABILITY',
    ]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
        'balance' => 100,
        'available_balance' => 100,
    ]);
    $rule = AccountDefaultRule::create([
        'organization_id' => $organization->id,
        'account_type' => 'SAVINGS',
        'name' => 'Late savings payment',
        'fine_calculation' => 'FIXED',
        'fine_amount' => 10,
        'effective_from' => now()->toDateString(),
    ]);
    $event = AccountDefaultEvent::create([
        'financial_account_id' => $account->id,
        'account_default_rule_id' => $rule->id,
        'due_date' => now()->subDay()->toDateString(),
        'assessed_at' => now()->toDateString(),
        'days_overdue' => 1,
        'status' => 'OPEN',
    ]);
    $fine = AccountFine::create([
        'financial_account_id' => $account->id,
        'account_default_event_id' => $event->id,
        'assessed_at' => now()->toDateString(),
        'assessed_amount' => 10,
        'paid_amount' => 0,
        'waived_amount' => 0,
        'status' => 'ASSESSED',
    ]);
    $service = app(FinancialTransactionService::class);
    $data = [
        'account_fine_id' => $fine->id,
        'amount' => 10,
        'payment_date' => now()->toDateString(),
        'idempotency_key' => (string) Str::uuid(),
    ];

    $first = $service->createFinePayment($data, $organization->id, $user->id);
    $retry = $service->createFinePayment($data, $organization->id, $user->id);
    $service->post($first, $organization->id, $user->id);

    expect($retry->id)->toBe($first->id)
        ->and($fine->fresh()->paid_amount)->toBe('10.0000')
        ->and($fine->fresh()->status)->toBe('PAID');

    $service->reverse($first->fresh(), $organization->id);

    expect($fine->fresh()->paid_amount)->toBe('0.0000')
        ->and($fine->fresh()->status)->toBe('ASSESSED');

    expect(app(DefaultFineService::class)->waiveFine($fine->fresh(), $user->id)->status)->toBe('WAIVED');
});
