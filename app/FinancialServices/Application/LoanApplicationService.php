<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanCollateral;
use App\FinancialServices\Models\LoanGuarantor;
use App\FinancialServices\Models\LoanProtectionPolicy;
use App\FinancialServices\Models\LoanProtectionProduct;
use App\CustomerModule\Models\Customer;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class LoanApplicationService
{
    public function __construct(private readonly FinancialProductPolicyService $policyService)
    {
    }

    public function create(array $data, int $organizationId): LoanApplication
    {
        $details = $this->extractDraftDetails($data);
        $this->removeDraftDetails($data);
        $product = LoanProduct::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->findOrFail($data['financial_product_id']);
        $this->policyService->validateLoanAmount($product, (float) $data['requested_amount']);
        $protectionProductId = !empty($data['loan_protection_product_id'])
            ? LoanProtectionProduct::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->whereKey($data['loan_protection_product_id'])
                ->value('id')
            : null;
        if (!empty($data['loan_protection_product_id']) && !$protectionProductId) {
            throw new RuntimeException('The selected credit-life product is unavailable.');
        }

        $data['loan_product_id'] = $product->id;
        $data['loan_protection_product_id'] = $protectionProductId;
        unset($data['financial_product_id']);
        $data['organization_id'] = $organizationId;
        $data['application_no'] = $this->nextNumber($organizationId);
        $data['status'] = 'DRAFT';

        $uploadedPaths = [];

        try {
            return DB::transaction(function () use ($data, $details, &$uploadedPaths): LoanApplication {
                $application = LoanApplication::create($data);
                $this->saveDraftDetails($application, $details, $uploadedPaths);

                return $application;
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($uploadedPaths);
            throw $exception;
        }
    }

    public function updateDraft(LoanApplication $application, array $data): LoanApplication
    {
        if ($application->status !== 'DRAFT') {
            throw new RuntimeException('Only draft loan applications can be updated.');
        }

        $details = $this->extractDraftDetails($data);
        $product = LoanProduct::query()
            ->where('organization_id', $application->organization_id)
            ->where('status', true)
            ->findOrFail($data['financial_product_id']);
        $this->policyService->validateLoanAmount($product, (float) $data['requested_amount']);
        $protectionProductId = null;
        if (!empty($data['loan_protection_product_id'])) {
            $protectionProductQuery = LoanProtectionProduct::query()
                ->where('organization_id', $application->organization_id)
                ->where(function ($query) use ($application): void {
                    $query->where('status', true);
                    if ($application->loan_protection_product_id) {
                        $query->orWhere('id', $application->loan_protection_product_id);
                    }
                });
            $protectionProductId = $protectionProductQuery
                ->whereKey($data['loan_protection_product_id'])
                ->value('id');
            if (!$protectionProductId) {
                throw new RuntimeException('The selected credit-life product is unavailable.');
            }
        }

        $uploadedPaths = [];

        try {
            return DB::transaction(function () use ($application, $data, $details, $product, $protectionProductId, &$uploadedPaths): LoanApplication {
                $application->update([
                    'branch_id' => $data['branch_id'] ?? null,
                    'customer_id' => $data['customer_id'],
                    'loan_product_id' => $product->id,
                    'loan_protection_product_id' => $protectionProductId,
                    'requested_amount' => $data['requested_amount'],
                    'requested_term_months' => $data['requested_term_months'],
                    'purpose' => $data['purpose'] ?? null,
                ]);
                $this->saveDraftDetails($application, $details, $uploadedPaths);

                return $application->refresh();
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($uploadedPaths);
            throw $exception;
        }
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

        $application->loadMissing(['product', 'customer', 'loanProtectionProduct']);
        $product = $application->product;
        $interestCalculation = in_array($product->interest_calculation, ['SIMPLE', 'FLAT', 'REDUCING_BALANCE'], true)
            ? $product->interest_calculation
            : 'SIMPLE';
        $contractualRate = (float) $product->interest_rate;
        $interestFrequency = $product->interest_frequency ?: 'MONTHLY';

        return DB::transaction(function () use ($application, $interestCalculation, $contractualRate, $interestFrequency): LoanAccount {
            $financialAccount = FinancialAccount::create([
                'organization_id' => $application->organization_id,
                'branch_id' => $application->branch_id,
                'product_type' => LoanProduct::class,
                'product_id' => $application->loan_product_id,
                'holder_type' => Customer::class,
                'holder_id' => $application->customer_id,
                'account_no' => $this->nextFinancialAccountNumber($application->organization_id),
                'name' => $application->customer->name . ' Loan',
                'account_type' => 'LOAN',
                'status' => 'ACTIVE',
                'opened_at' => CarbonImmutable::today()->toDateString(),
            ]);

            $loanAccount = $application->loanAccount()->create([
                'financial_account_id' => $financialAccount->id,
                'loan_no' => 'LN-' . str_pad((string) $application->id, 8, '0', STR_PAD_LEFT),
                'principal_amount' => $application->approved_amount,
                'disbursed_amount' => 0,
                'contractual_rate' => $contractualRate,
                'interest_calculation' => $interestCalculation,
                'term_value' => $application->requested_term_months,
                'term_unit' => 'MONTH',
                'interest_frequency' => $interestFrequency,
                'repayment_frequency' => 'MONTHLY',
                'approved_at' => $application->approved_at?->toDateString(),
                'maturity_date' => CarbonImmutable::parse($application->approved_at ?? now())->addMonthsNoOverflow((int) $application->requested_term_months)->toDateString(),
                'status' => 'APPROVED',
            ]);

            if ($application->loanProtectionProduct) {
                $loanAccount->protectionPolicy()->create([
                    'loan_protection_product_id' => $application->loanProtectionProduct->id,
                    'monthly_rate_percent' => $application->loanProtectionProduct->monthly_rate_percent,
                    'required' => false,
                    'coverage_amount' => $loanAccount->principal_amount,
                    'initial_fee' => 0,
                    'renewal_fee' => 0,
                    'renewal_frequency' => 'MONTHLY',
                    'next_renewal_at' => CarbonImmutable::today()->addMonthNoOverflow()->toDateString(),
                    'status' => 'ACTIVE',
                ]);
            }

            return $loanAccount;
        });
    }

    public function addCollateral(LoanApplication $application, array $data): LoanCollateral
    {
        if (in_array($application->status, ['REJECTED', 'CANCELLED'], true)) {
            throw new RuntimeException('Collateral cannot be added to a closed application.');
        }

        return $application->collaterals()->create([
            ...$data,
            'status' => 'PENDING',
        ]);
    }

    public function verifyCollateral(LoanApplication $application, LoanCollateral $collateral, bool $approved, ?string $notes = null): LoanCollateral
    {
        $this->ensureApplicationChild($application, $collateral->loan_application_id, 'collateral');

        $collateral->update([
            'status' => $approved ? 'VERIFIED' : 'REJECTED',
            'verified_at' => now()->toDateString(),
            'notes' => $notes ?? $collateral->notes,
        ]);

        return $collateral->refresh();
    }

    public function releaseCollateral(LoanApplication $application, LoanCollateral $collateral, ?string $notes = null): LoanCollateral
    {
        $this->ensureApplicationChild($application, $collateral->loan_application_id, 'collateral');
        if ($collateral->status !== 'VERIFIED') {
            throw new RuntimeException('Only verified collateral can be released.');
        }

        $collateral->update(['status' => 'RELEASED', 'notes' => $notes ?? $collateral->notes]);

        return $collateral->refresh();
    }

    public function addGuarantor(LoanApplication $application, int $customerId, ?string $notes = null): LoanGuarantor
    {
        if (in_array($application->status, ['REJECTED', 'CANCELLED'], true)) {
            throw new RuntimeException('A guarantor cannot be added to a closed application.');
        }

        $customer = Customer::query()
            ->where('organization_id', $application->organization_id)
            ->whereKey($customerId)
            ->firstOrFail();
        if ($customer->id === $application->customer_id) {
            throw new RuntimeException('The applicant cannot be their own guarantor.');
        }
        if ($application->guarantors()->where('customer_id', $customer->id)->whereIn('status', ['PENDING', 'ACCEPTED'])->exists()) {
            throw new RuntimeException('This customer is already a guarantor for the application.');
        }

        return $application->guarantors()->create(['customer_id' => $customer->id, 'status' => 'PENDING', 'notes' => $notes]);
    }

    public function decideGuarantor(LoanApplication $application, LoanGuarantor $guarantor, bool $accepted, ?string $notes = null): LoanGuarantor
    {
        $this->ensureApplicationChild($application, $guarantor->loan_application_id, 'guarantor');
        if ($guarantor->status !== 'PENDING') {
            throw new RuntimeException('Only pending guarantor invitations can be decided.');
        }

        $guarantor->update([
            'status' => $accepted ? 'ACCEPTED' : 'REJECTED',
            'accepted_at' => $accepted ? now() : null,
            'notes' => $notes ?? $guarantor->notes,
        ]);

        return $guarantor->refresh();
    }

    public function configureProtection(LoanApplication $application, array $data): LoanProtectionPolicy
    {
        $loanAccount = $application->loanAccount;
        if (!$loanAccount) {
            throw new RuntimeException('Create the loan account before configuring protection.');
        }
        if (in_array($loanAccount->status, ['CLOSED', 'CANCELLED'], true)) {
            throw new RuntimeException('Protection cannot be configured for a closed loan account.');
        }

        return $loanAccount->protectionPolicy()->updateOrCreate([], [
            ...$data,
            'status' => 'PENDING',
        ]);
    }

    public function setProtectionStatus(LoanApplication $application, string $status): LoanProtectionPolicy
    {
        $policy = $application->loanAccount?->protectionPolicy;
        if (!$policy) {
            throw new RuntimeException('No protection policy is configured for this loan account.');
        }
        if (!in_array($status, ['ACTIVE', 'CANCELLED'], true)) {
            throw new RuntimeException('Invalid protection status.');
        }
        if ($status === 'ACTIVE' && $policy->required && (float) $policy->coverage_amount <= 0) {
            throw new RuntimeException('Required protection must have a positive coverage amount.');
        }

        $policy->update(['status' => $status]);

        return $policy->refresh();
    }

    private function ensureApplicationChild(LoanApplication $application, ?int $applicationId, string $child): void
    {
        if ($applicationId !== $application->id) {
            throw new RuntimeException("The {$child} does not belong to this application.");
        }
    }

    private function extractDraftDetails(array $data): array
    {
        return [
            'income_details' => $data['income_details'] ?? [],
            'expense_details' => $data['expense_details'] ?? [],
            'job_histories' => $data['job_histories'] ?? [],
            'asset_details' => $data['asset_details'] ?? [],
            'educations' => $data['educations'] ?? [],
            'supporting_documents' => $data['supporting_documents'] ?? [],
        ];
    }

    private function removeDraftDetails(array &$data): void
    {
        foreach (['income_details', 'expense_details', 'job_histories', 'asset_details', 'educations', 'supporting_documents'] as $key) {
            unset($data[$key]);
        }
    }

    private function saveDraftDetails(LoanApplication $application, array $details, array &$uploadedPaths): void
    {
        foreach ([
            'income_details' => 'incomeDetails',
            'expense_details' => 'expenseDetails',
            'job_histories' => 'jobHistories',
            'asset_details' => 'assetDetails',
            'educations' => 'educations',
        ] as $key => $relationship) {
            $relation = $application->{$relationship}();
            $relation->delete();
            if ($details[$key]) {
                $relation->createMany($details[$key]);
            }
        }

        foreach ($details['supporting_documents'] as $documentData) {
            $file = $documentData['file'] ?? null;
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store("loan-applications/{$application->id}/supporting-documents", 'local');
            $uploadedPaths[] = $path;
            $application->supportingDocuments()->create([
                'document_type' => $documentData['document_type'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }
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