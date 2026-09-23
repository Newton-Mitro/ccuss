<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Models\LoanAccount;
use App\CustomerModule\Models\Customer;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LoanApplicationService
{
    public function __construct(private readonly FinancialProductPolicyService $policyService)
    {
    }

    public function create(array $data, int $organizationId): LoanApplication
    {
        $product = FinancialProduct::query()
            ->where('organization_id', $organizationId)
            ->where('category', 'LOAN')
            ->where('status', true)
            ->findOrFail($data['financial_product_id']);
        $this->policyService->validateLoanAmount($product, (float) $data['requested_amount']);

        $data['organization_id'] = $organizationId;
        $data['application_no'] = $this->nextNumber($organizationId);
        $data['status'] = 'DRAFT';

        return LoanApplication::create($data);
    }

    public function submit(LoanApplication $application): LoanApplication
    {
        if ($application->status !== 'DRAFT') {
            throw new RuntimeException('Only draft loan applications can be submitted.');
        }

        $application->update(['status' => 'SUBMITTED', 'applied_at' => CarbonImmutable::today()->toDateString()]);

        return $application->refresh();
    }

    public function startReview(LoanApplication $application): LoanApplication
    {
        if ($application->status !== 'SUBMITTED') {
            throw new RuntimeException('Only submitted loan applications can enter review.');
        }

        $application->update(['status' => 'UNDER_REVIEW']);

        return $application->refresh();
    }

    public function approve(LoanApplication $application, array $data, int $userId): LoanApplication
    {
        if (!in_array($application->status, ['SUBMITTED', 'UNDER_REVIEW'], true)) {
            throw new RuntimeException('Only submitted or under-review applications can be approved.');
        }

        $approvedAmount = (float) ($data['approved_amount'] ?? $application->requested_amount);
        if ($approvedAmount > (float) $application->requested_amount) {
            throw new RuntimeException('The approved amount cannot exceed the requested amount.');
        }

        $application->update([
            'status' => 'APPROVED',
            'approved_amount' => $approvedAmount,
            'approved_at' => now(),
            'approved_by' => $userId,
            'decision_note' => $data['decision_note'] ?? null,
        ]);

        return $application->refresh();
    }

    public function reject(LoanApplication $application, array $data): LoanApplication
    {
        if (!in_array($application->status, ['SUBMITTED', 'UNDER_REVIEW'], true)) {
            throw new RuntimeException('Only submitted or under-review applications can be rejected.');
        }

        $application->update(['status' => 'REJECTED', 'decision_note' => $data['decision_note'] ?? null]);

        return $application->refresh();
    }

    public function createLoanAccount(LoanApplication $application): LoanAccount
    {
        if ($application->status !== 'APPROVED') {
            throw new RuntimeException('Only approved loan applications can create loan accounts.');
        }

        if ($application->loanAccount()->exists()) {
            throw new RuntimeException('This loan application already has a loan account.');
        }

        $application->loadMissing(['product', 'customer']);
        $interestCalculation = in_array($application->product->interest_calculation, ['SIMPLE', 'FLAT', 'REDUCING_BALANCE'], true)
            ? $application->product->interest_calculation
            : 'SIMPLE';

        return DB::transaction(function () use ($application, $interestCalculation): LoanAccount {
            $financialAccount = FinancialAccount::create([
                'organization_id' => $application->organization_id,
                'branch_id' => $application->branch_id,
                'financial_product_id' => $application->financial_product_id,
                'holder_type' => Customer::class,
                'holder_id' => $application->customer_id,
                'account_no' => $this->nextFinancialAccountNumber($application->organization_id),
                'name' => $application->customer->name . ' Loan',
                'account_type' => 'LOAN',
                'status' => 'PENDING',
            ]);

            return $application->loanAccount()->create([
                'customer_id' => $application->customer_id,
                'financial_account_id' => $financialAccount->id,
                'financial_product_id' => $application->financial_product_id,
                'loan_no' => 'LN-' . str_pad((string) $application->id, 8, '0', STR_PAD_LEFT),
                'principal_amount' => $application->approved_amount,
                'disbursed_amount' => 0,
                'contractual_rate' => $application->product->interest_rate,
                'interest_calculation' => $interestCalculation,
                'term_months' => $application->requested_term_months,
                'approved_at' => $application->approved_at?->toDateString(),
                'maturity_date' => CarbonImmutable::parse($application->approved_at ?? now())->addMonthsNoOverflow((int) $application->requested_term_months)->toDateString(),
                'status' => 'APPROVED',
            ]);
        });
    }

    public function queryForOrganization(int $organizationId): Builder
    {
        return LoanApplication::query()->where('organization_id', $organizationId);
    }

    private function nextNumber(int $organizationId): string
    {
        $next = ((int) LoanApplication::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return sprintf('LA-%06d', $next);
    }

    private function nextFinancialAccountNumber(int $organizationId): string
    {
        $next = ((int) FinancialAccount::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return sprintf('LOAN-%06d', $next);
    }
}