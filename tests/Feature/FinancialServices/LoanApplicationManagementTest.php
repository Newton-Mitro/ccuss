<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\DefaultFineService;
use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Application\LoanApplicationService;
use App\FinancialServices\Application\LoanProtectionClaimService;
use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Models\AccountDefaultRule;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanProtectionPolicy;
use App\FinancialServices\Models\LoanProtectionProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Notifications\ApprovalWorkflowNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

function loanApplicationFixture(): array
{
    $organization = Organization::factory()->create(['code' => 'ORG-001']);
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

it('notifies organization reviewers when a loan application is submitted', function () {
    Notification::fake();
    $fixture = loanApplicationFixture();
    $reviewer = User::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'status' => User::STATUS_ACTIVE,
    ]);
    $createPermission = Permission::updateOrCreate(
        ['slug' => 'financial.loan-applications.create'],
        ['module' => 'Loan Applications', 'name' => 'Create', 'action' => 'create'],
    );
    $reviewPermission = Permission::updateOrCreate(
        ['slug' => 'financial.loan-applications.manage'],
        ['module' => 'Loan Applications', 'name' => 'Manage', 'action' => 'manage'],
    );
    $viewPermission = Permission::updateOrCreate(
        ['slug' => 'financial.loan-applications.view'],
        ['module' => 'Loan Applications', 'name' => 'View', 'action' => 'view'],
    );
    $creatorRole = Role::query()->create(['name' => 'Loan creator', 'slug' => 'loan-creator']);
    $reviewerRole = Role::query()->create(['name' => 'Loan reviewer', 'slug' => 'loan-reviewer']);
    $creatorRole->permissions()->attach($createPermission);
    $reviewerRole->permissions()->attach([$reviewPermission->id, $viewPermission->id]);
    $fixture['user']->roles()->attach($creatorRole);
    $reviewer->roles()->attach($reviewerRole);

    $application = app(LoanApplicationService::class)->create([
        'branch_id' => $fixture['branch']->id,
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 500,
        'requested_term_months' => 6,
    ], $fixture['organization']->id);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('loan-applications.submit', $application))
        ->assertRedirect();

    Notification::assertSentTo($reviewer, ApprovalWorkflowNotification::class);
    Notification::assertNotSentTo($fixture['user'], ApprovalWorkflowNotification::class);
});

it('updates draft loan application details and rejects updates after submission', function () {
    $fixture = loanApplicationFixture();
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 500,
        'requested_term_months' => 6,
        'purpose' => 'Initial purpose',
    ], $fixture['organization']->id);

    $updated = $service->updateDraft($application, [
        'branch_id' => $fixture['branch']->id,
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 750,
        'requested_term_months' => 9,
        'purpose' => 'Updated purpose',
    ]);

    expect((float) $updated->requested_amount)->toBe(750.0)
        ->and($updated->requested_term_months)->toBe(9)
        ->and($updated->purpose)->toBe('Updated purpose');

    $service->submit($updated);

    expect(fn () => $service->updateDraft($updated, [
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 900,
        'requested_term_months' => 12,
    ]))->toThrow(RuntimeException::class, 'Only draft loan applications can be updated.');
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

    expect(fn () => $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1001,
        'requested_term_months' => 12,
    ], $fixture['organization']->id))
        ->toThrow(\Illuminate\Validation\ValidationException::class, 'requested loan amount exceeds the product maximum');

    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1000,
        'requested_term_months' => 12,
    ], $fixture['organization']->id);
    $service->submit($application);

    expect(fn () => $service->approve($application, ['approved_amount' => 1001], $fixture['user']->id))
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
    $financialAccount = FinancialAccount::query()->whereKey($loan->financial_account_id)->firstOrFail();

    expect($loan->loan_no)->toBe('LN-'.str_pad((string) $application->id, 8, '0', STR_PAD_LEFT))
        ->and($loan->status)->toBe('APPROVED')
        ->and($financialAccount->account_type)->toBe('LOAN')
        ->and($financialAccount->status)->toBe('ACTIVE')
        ->and($financialAccount->opened_at)->not->toBeNull();

    expect(fn () => $service->createLoanAccount($application->fresh()))
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
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $fixture['customer']->id,
        'account_type' => 'SAVINGS',
    ]);
    $collateral = $service->addCollateral($application, [
        'type' => 'DEPOSIT_LIEN',
        'financial_account_id' => $financialAccount->id,
        'description' => 'Deposited savings account',
        'assessed_value' => 10000,
        'secured_value' => 7500,
    ]);

    expect($collateral->status)->toBe('PENDING')
        ->and($collateral->financial_account_id)->toBe($financialAccount->id);
    expect($service->verifyCollateral($application, $collateral, true)->status)->toBe('VERIFIED');

    $otherApplication = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'requested_amount' => 1000,
        'requested_term_months' => 6,
    ], $fixture['organization']->id);

    expect(fn () => $service->verifyCollateral($otherApplication, $collateral, false))
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
    expect(fn () => $service->addGuarantor($application, $guarantor->id))
        ->toThrow(RuntimeException::class, 'already a guarantor');
    expect(fn () => $service->addGuarantor($application, $fixture['customer']->id))
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

    expect(fn () => $service->setProtectionStatus($application->fresh(), 'ACTIVE'))
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

it('enrolls an optional credit-life product and calculates monthly premiums on remaining principal', function () {
    $fixture = loanApplicationFixture();
    $protectionProduct = LoanProtectionProduct::query()->create([
        'organization_id' => $fixture['organization']->id,
        'code' => 'CL-1PCT',
        'name' => 'Credit life 1 percent',
        'monthly_rate_percent' => 1,
        'status' => true,
    ]);
    $service = app(LoanApplicationService::class);
    $application = $service->create([
        'customer_id' => $fixture['customer']->id,
        'financial_product_id' => $fixture['product']->id,
        'loan_protection_product_id' => $protectionProduct->id,
        'requested_amount' => 1200,
        'requested_term_months' => 3,
    ], $fixture['organization']->id);
    $service->submit($application);
    $service->approve($application, [], $fixture['user']->id);
    $loan = $service->createLoanAccount($application->fresh());
    $policy = $loan->protectionPolicy()->firstOrFail();

    $schedules = app(LoanScheduleService::class)->generate($loan, [
        'frequency' => 'MONTHLY',
        'start_date' => '2026-01-31',
    ]);

    expect($application->fresh()->loan_protection_product_id)->toBe($protectionProduct->id)
        ->and($policy->loan_protection_product_id)->toBe($protectionProduct->id)
        ->and((float) $policy->monthly_rate_percent)->toBe(1.0)
        ->and((float) $schedules[0]->scheduled_protection_fee)->toBe(8.0)
        ->and((float) $schedules[1]->scheduled_protection_fee)->toBe(4.0)
        ->and((float) $schedules[2]->scheduled_protection_fee)->toBe(0.0);

    $arrears = app(LoanScheduleService::class)->assessArrears($loan, '2026-03-01');
    expect($arrears)->toHaveCount(1)
        ->and((float) $arrears[0]->fee_overdue)->toBe(8.0)
        ->and($policy->fresh()->status)->toBe('ACTIVE');
});

it('settles a credit-life death claim through the ledger and restores coverage if the payout is reversed', function () {
    $fixture = loanApplicationFixture();
    Storage::fake('local');
    $protectionProduct = LoanProtectionProduct::query()->create([
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
        'requested_amount' => 1200,
        'requested_term_months' => 3,
    ], $fixture['organization']->id);
    $applicationService->submit($application);
    $applicationService->approve($application, [], $fixture['user']->id);
    $loan = $applicationService->createLoanAccount($application->fresh());
    $loan->update(['disbursed_amount' => 1200, 'status' => 'ACTIVE']);
    $loan->financialAccount()->update(['balance' => 1200, 'available_balance' => 1200]);
    app(LoanScheduleService::class)->generate($loan, [
        'frequency' => 'MONTHLY',
        'start_date' => '2026-01-31',
    ]);
    $payoutAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'balance' => 0,
        'available_balance' => 0,
    ]);

    $claimService = app(LoanProtectionClaimService::class);
    $claim = $claimService->submit($application, [
        'death_date' => '2026-02-15',
        'death_certificate' => UploadedFile::fake()->create('death-certificate.pdf', 100, 'application/pdf'),
    ], $fixture['user']->id);
    $claim = $claimService->approve($application, $claim, [
        'payout_account_id' => $payoutAccount->id,
        'decision_note' => 'Claim verified',
    ], $fixture['organization']->id, $fixture['user']->id);
    $transaction = FinancialTransaction::query()->findOrFail($claim->financial_transaction_id);

    expect($claim->status)->toBe('APPROVED')
        ->and((float) $claim->payout_amount)->toBe(1200.0)
        ->and($transaction->status)->toBe('PENDING');

    $transactionService = app(FinancialTransactionService::class);
    $transactionService->post($transaction, $fixture['organization']->id, $fixture['user']->id);

    expect($claim->fresh()->status)->toBe('SETTLED')
        ->and($loan->fresh()->status)->toBe('CLOSED')
        ->and($loan->financialAccount->fresh()->status)->toBe('CLOSED')
        ->and($loan->protectionPolicy()->first()->status)->toBe('CANCELLED');
    expect(fn () => app(LoanScheduleService::class)->generate($loan->fresh()))
        ->toThrow(RuntimeException::class, 'Closed loans cannot generate repayment schedules');
    expect(fn () => app(LoanScheduleService::class)->assessArrears($loan->fresh()))
        ->toThrow(RuntimeException::class, 'Closed loans cannot accrue arrears');

    $transactionService->reverse($transaction->fresh(), $fixture['organization']->id);

    expect($claim->fresh()->status)->toBe('SUBMITTED')
        ->and($loan->fresh()->status)->toBe('ACTIVE')
        ->and($loan->financialAccount->fresh()->status)->toBe('ACTIVE')
        ->and($loan->protectionPolicy()->first()->status)->toBe('ACTIVE');
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
