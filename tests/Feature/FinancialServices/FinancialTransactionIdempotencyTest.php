<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanDisbursement;
use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
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
});
