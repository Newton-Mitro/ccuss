<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\CustomerModule\Models\Customer;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class FinancialProductPolicyService
{
    public function validateAccountOpening(FinancialProduct $product, Customer $customer): void
    {
        $policy = $this->activePolicy($product);

        if (!$policy) {
            return;
        }

        $eligibility = $policy->eligibility_rules ?? [];
        $allowedTypes = $eligibility['customer_types'] ?? $eligibility['allowed_customer_types'] ?? null;

        if (is_array($allowedTypes) && !in_array($customer->type, $allowedTypes, true)) {
            throw ValidationException::withMessages([
                'holder_id' => 'The selected customer is not eligible for this product.',
            ]);
        }

        $requiredDocuments = collect($policy->documentation_requirements ?? [])
            ->filter(fn($required) => $required === true || $required === 1 || $required === 'true')
            ->keys()
            ->map(fn(string $documentType) => strtoupper($documentType))
            ->values();

        if ($requiredDocuments->isEmpty()) {
            return;
        }

        $verifiedDocuments = $customer->kycDocuments()
            ->where('verification_status', 'VERIFIED')
            ->pluck('document_type')
            ->map(fn(string $documentType) => strtoupper($documentType));

        $aliases = [
            'IDENTITY' => ['NATIONAL_IDENTIFICATION_NUMBER', 'SMART_NID', 'PASSPORT', 'DRIVING_LICENSE', 'BIRTH_CERTIFICATE'],
            'ADDRESS' => ['UTILITY_BILL', 'ELECTRICITY_BILL', 'WATER_BILL', 'GAS_BILL', 'BANK_STATEMENT', 'RENTAL_AGREEMENT'],
        ];

        $missing = $requiredDocuments->reject(function (string $documentType) use ($verifiedDocuments, $aliases): bool {
            $acceptedTypes = $aliases[$documentType] ?? [$documentType];

            return $verifiedDocuments->intersect($acceptedTypes)->isNotEmpty();
        });

        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages([
                'holder_id' => 'Required verified KYC documents are missing: ' . $missing->implode(', ') . '.',
            ]);
        }
    }

    public function validateDeposit(FinancialAccount $account, float $amount): void
    {
        $policy = $this->activePolicy($account->product);

        if (!$policy) {
            return;
        }

        if ($policy->minimum_deposit_amount !== null && $amount < (float) $policy->minimum_deposit_amount) {
            throw new RuntimeException('The deposit amount is below the product minimum.');
        }

        if ($policy->maximum_deposit_amount !== null && $amount > (float) $policy->maximum_deposit_amount) {
            throw new RuntimeException('The deposit amount exceeds the product maximum.');
        }
    }

    public function validateLoanAmount(FinancialProduct $product, float $amount): void
    {
        $policy = $this->activePolicy($product);

        if ($policy?->maximum_loan_amount !== null && $amount > (float) $policy->maximum_loan_amount) {
            throw new RuntimeException('The loan amount exceeds the product maximum.');
        }
    }

    private function activePolicy(?FinancialProduct $product): ?FinancialProductPolicy
    {
        if (!$product) {
            return null;
        }

        $today = CarbonImmutable::today();

        return $product->policy()
            ->where('status', 'ACTIVE')
            ->where(fn($query) => $query->whereNull('effective_from')->orWhereDate('effective_from', '<=', $today))
            ->where(fn($query) => $query->whereNull('effective_until')->orWhereDate('effective_until', '>=', $today))
            ->first();
    }
}