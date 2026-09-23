<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\LoanApplicationService;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

function loanApplicationFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'LOAN',
        'balance_type' => 'ASSET',
    ]);

    return compact('organization', 'branch', 'user', 'customer', 'product');
}

it('creates and transitions a loan application through approval', function () {
    $fixture = loanApplicationFixture();
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'branch_id' => $fixture['branch']->id,
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 5000,
        'requested_term_months' => 12,
        'purpose' => 'Working capital',
    ], $fixture['organization']->id);

    expect($application->status)->toBe('DRAFT')
        ->and($application->application_no)->toStartWith('LA-');

    $service->submit($application);
    $service->startReview($application);
    $approved = $service->approve($application, ['approved_amount' => 4500, 'decision_note' => 'Approved with adjustment'], $fixture['user']->id);

    expect($approved->status)->toBe('APPROVED')
        ->and((float) $approved->approved_amount)->toBe(4500.0)
        ->and($approved->approved_by)->toBe($fixture['user']->id);
});

it('rejects excessive approval and enforces the product loan ceiling', function () {
    $fixture = loanApplicationFixture();
    FinancialProductPolicy::factory()->create([
        'financial_product_id' => $fixture['product']->id,
        'maximum_loan_amount' => 1000,
        'status' => 'ACTIVE',
        'effective_from' => now()->subDay()->toDateString(),
    ]);
    $service = app(LoanApplicationService::class);

    expect(fn() => $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1001,
        'requested_term_months' => 12,
    ], $fixture['organization']->id))->toThrow(RuntimeException::class, 'exceeds the product maximum');

    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1000,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);
    $service->submit($application);

    expect(fn() => $service->approve($application, ['approved_amount' => 1001], $fixture['user']->id))
        ->toThrow(RuntimeException::class, 'cannot exceed');
});

it('rejects a loan application after review', function () {
    $fixture = loanApplicationFixture();
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 500,
        'requested_term_months' => 6,
    ], $fixture['organization']->id);
    $service->submit($application);
    $service->startReview($application);
    $rejected = $service->reject($application, ['decision_note' => 'Insufficient security']);

    expect($rejected->status)->toBe('REJECTED')
        ->and($rejected->decision_note)->toBe('Insufficient security');
});

it('creates one linked financial and loan account after approval', function () {
    $fixture = loanApplicationFixture();
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'branch_id' => $fixture['branch']->id,
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 5000,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);
    $service->submit($application);
    $service->approve($application, [], $fixture['user']->id);

    $loan = $service->createLoanAccount($application->fresh());

    expect($loan->loan_no)->toBe('LN-' . str_pad((string) $application->id, 8, '0', STR_PAD_LEFT))
        ->and($loan->status)->toBe('APPROVED')
        ->and(FinancialAccount::query()->whereKey($loan->financial_account_id)->value('account_type'))->toBe('LOAN');

    expect(fn() => $service->createLoanAccount($application->fresh()))
        ->toThrow(RuntimeException::class, 'already has a loan account');
});
