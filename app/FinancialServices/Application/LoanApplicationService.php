<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\LoanApplication;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
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

    public function queryForOrganization(int $organizationId): Builder
    {
        return LoanApplication::query()->where('organization_id', $organizationId);
    }

    private function nextNumber(int $organizationId): string
    {
        $next = ((int) LoanApplication::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return sprintf('LA-%06d', $next);
    }
}