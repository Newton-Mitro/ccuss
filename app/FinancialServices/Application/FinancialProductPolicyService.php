<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use Carbon\CarbonImmutable;
use RuntimeException;

class FinancialProductPolicyService
{
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