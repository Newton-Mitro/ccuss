<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\LoanApplicationService;
use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Application\DefaultFineService;
use App\FinancialServices\Models\AccountDefaultRule;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanProtectionPolicy;
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

it('registers and verifies loan collateral for the owning application', function () {
    $fixture = loanApplicationFixture();
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 5000,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);
    $collateral = $service->addCollateral($application, [
        'type' => 'PROPERTY',
        'description' => 'Residential property',
        'assessed_value' => 10000,
        'secured_value' => 7500,
    ]);

    expect($collateral->status)->toBe('PENDING');
    expect($service->verifyCollateral($application, $collateral, true)->status)->toBe('VERIFIED');

    $otherApplication = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1000,
        'requested_term_months' => 6,
    ], $fixture['organization']->id);

    expect(fn() => $service->verifyCollateral($otherApplication, $collateral, false))
        ->toThrow(RuntimeException::class, 'does not belong');

    expect($service->releaseCollateral($application, $collateral)->status)->toBe('RELEASED');
});

it('manages guarantor invitations with organization and duplicate checks', function () {
    $fixture = loanApplicationFixture();
    $guarantor = Customer::factory()->individualFemale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 5000,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);

    $invitation = $service->addGuarantor($application, $guarantor->id);
    expect($service->decideGuarantor($application, $invitation, true)->status)->toBe('ACCEPTED');
    expect(fn() => $service->addGuarantor($application, $guarantor->id))
        ->toThrow(RuntimeException::class, 'already a guarantor');
    expect(fn() => $service->addGuarantor($application, $fixture['customer']->id))
        ->toThrow(RuntimeException::class, 'cannot be their own guarantor');
});

it('configures and activates required loan protection', function () {
    $fixture = loanApplicationFixture();
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 5000,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);
    $service->submit($application);
    $service->approve($application, [], $fixture['user']->id);
    $service->createLoanAccount($application->fresh());

    expect(fn() => $service->setProtectionStatus($application->fresh(), 'ACTIVE'))
        ->toThrow(RuntimeException::class, 'No protection policy');

    $policy = $service->configureProtection($application->fresh(), [
        'required' => true,
        'coverage_amount' => 10000,
        'initial_fee' => 25,
        'renewal_fee' => 10,
        'renewal_frequency' => 'YEARLY',
        'next_renewal_at' => now()->addYear()->toDateString(),
    ]);
    expect($policy)->toBeInstanceOf(LoanProtectionPolicy::class)
        ->and($service->setProtectionStatus($application->fresh(), 'ACTIVE')->status)->toBe('ACTIVE');
});

it('generates a reproducible reducing-balance schedule across month boundaries', function () {
    $fixture = loanApplicationFixture();
    $fixture['product']->update(['interest_calculation' => 'REDUCING_BALANCE', 'interest_rate' => 12]);
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1000,
        'requested_term_months' => 3,
    ], $fixture['organization']->id);
    $service->submit($application);
    $service->approve($application, [], $fixture['user']->id);
    $loan = $service->createLoanAccount($application->fresh());

    $schedules = app(LoanScheduleService::class)->generate($loan, ['frequency' => 'MONTHLY', 'start_date' => '2026-01-31']);

    expect($schedules)->toHaveCount(3)
        ->and($schedules[0]->due_date->toDateString())->toBe('2026-02-28')
        ->and((float) $schedules[2]->scheduled_principal)->toBeGreaterThan(0)
        ->and($schedules[0]->generation_inputs['frequency'])->toBe('MONTHLY');

    $arrears = app(LoanScheduleService::class)->assessArrears($loan, '2026-03-01');
    expect($arrears)->toHaveCount(1)
        ->and($arrears[0]->status)->toBe('OPEN')
        ->and(app(LoanScheduleService::class)->assessArrears($loan, '2026-03-01'))->toHaveCount(1);

    expect(app(LoanScheduleService::class)->resolveArrear($arrears[0], 'WAIVED', $fixture['user']->id)->resolution_type)->toBe('WAIVED');

    $rule = app(DefaultFineService::class)->createRule([
        'account_type' => 'LOAN',
        'name' => 'Late loan payment',
        'grace_days' => 0,
        'fine_calculation' => 'PERCENTAGE',
        'fine_rate' => 10,
        'maximum_fine' => 25,
        'effective_from' => '2026-01-01',
    ], $fixture['organization']->id);
    $events = app(DefaultFineService::class)->assessOrganization($fixture['organization']->id, '2026-03-01');
    expect($rule)->toBeInstanceOf(AccountDefaultRule::class)
        ->and($events)->toHaveCount(1)
        ->and($events[0]->fines->first()->assessed_amount)->toBe('25.0000')
        ->and(app(DefaultFineService::class)->assessOrganization($fixture['organization']->id, '2026-03-01'))->toHaveCount(1);
});
