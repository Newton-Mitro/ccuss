<?php

namespace Database\Factories;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\DepositPolicy;
use App\FinancialServices\Models\LoanPolicy;
use App\FinancialServices\Models\FinancialProductPolicy;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialProductPolicyFactory extends Factory
{
    protected $model = FinancialProductPolicy::class;

    public function definition(): array
    {
        $isLoan = false;

        return [
            'financial_product_id' => FinancialProduct::factory(),
            'minimum_opening_amount' => fake()->randomFloat(4, 0, 5000),
            'minimum_deposit_amount' => $isLoan ? null : fake()->randomFloat(4, 50, 1000),
            'maximum_deposit_amount' => $isLoan ? null : fake()->randomFloat(4, 10000, 100000),
            'maximum_loan_amount' => $isLoan ? fake()->randomFloat(4, 10000, 1000000) : null,
            'loan_to_value_percent' => $isLoan ? fake()->randomFloat(4, 50, 90) : null,
            'interest_rebate_percent' => fake()->randomFloat(4, 0, 5),
            'deposit_amount_rules' => ['frequency' => 'MONTHLY', 'allowed_amounts' => [500, 1000, 2000]],
            'tenure_rules' => ['allowed_months' => [6, 12, 24, 36]],
            'loan_ceiling_rules' => $isLoan ? ['maximum_multiple' => 3] : null,
            'repayment_rules' => $isLoan ? ['frequency' => 'MONTHLY'] : null,
            'eligibility_rules' => ['membership_required' => true],
            'security_rules' => $isLoan ? ['required' => true] : null,
            'documentation_requirements' => ['identity' => true],
            'maturity_examples' => null,
            'source_url' => null,
            'source_checked_at' => now()->toDateString(),
            'effective_from' => now()->toDateString(),
            'effective_until' => null,
            'version' => '1.0',
            'status' => 'ACTIVE',
            'notes' => 'Factory policy for automated tests and development data.',
        ];
    }

    public function newModel(array $attributes = []): DepositPolicy|LoanPolicy
    {
        $productId = $attributes['financial_product_id'] ?? null;
        $isLoan = isset($attributes['maximum_loan_amount'])
            && $attributes['maximum_loan_amount'] !== null;
        if ($productId) {
            $loanExists = \Illuminate\Support\Facades\DB::table('loan_products')->where('id', $productId)->exists();
            $depositExists = \Illuminate\Support\Facades\DB::table('deposit_products')->where('id', $productId)->exists();
            if ($loanExists !== $depositExists) {
                $isLoan = $loanExists;
            }
        }

        $fields = $isLoan
            ? [
                'financial_product_id',
                'customer_can_open_multiple_account',
                'maximum_loan_amount',
                'loan_to_value_percent',
                'interest_rebate_percent',
                'loan_ceiling_rules',
                'repayment_rules',
                'eligibility_rules',
                'security_rules',
                'documentation_requirements',
                'source_url',
                'source_checked_at',
                'effective_from',
                'effective_until',
                'version',
                'status',
                'notes',
            ]
            : [
                'financial_product_id',
                'customer_can_open_multiple_account',
                'minimum_opening_amount',
                'minimum_deposit_amount',
                'maximum_deposit_amount',
                'interest_rebate_percent',
                'deposit_amount_rules',
                'tenure_rules',
                'eligibility_rules',
                'documentation_requirements',
                'maturity_examples',
                'source_url',
                'source_checked_at',
                'effective_from',
                'effective_until',
                'version',
                'status',
                'notes',
            ];
        $attributes = array_intersect_key($attributes, array_flip($fields));

        return $isLoan ? new LoanPolicy($attributes) : new DepositPolicy($attributes);
    }

    public function draft(): static
    {
        return $this->state(fn() => ['status' => 'DRAFT']);
    }

    public function retired(): static
    {
        return $this->state(fn() => ['status' => 'RETIRED', 'effective_until' => now()->toDateString()]);
    }
}
