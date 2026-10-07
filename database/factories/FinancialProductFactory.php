<?php

namespace Database\Factories;

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\DepositProductTerm;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\LoanProduct;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialProductFactory extends Factory
{
    protected $model = FinancialProduct::class;

    public function definition(): array
    {
        $category = 'SAVINGS';
        $isLoan = $category === 'LOAN';
        $hasInterest = !$isLoan || fake()->boolean(70);

        return [
            'organization_id' => Organization::factory(),
            'code' => strtoupper(fake()->unique()->bothify('???-###')),
            'name' => fake()->unique()->words(2, true),
            'category' => $category,
            'balance_type' => $isLoan ? 'ASSET' : fake()->randomElement(['LIABILITY', 'EQUITY']),
            'interest_calculation' => $hasInterest ? fake()->randomElement(['SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE']) : 'NONE',
            'interest_frequency' => $hasInterest ? fake()->randomElement(['DAILY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'MATURITY']) : 'NONE',
            'settings' => [
                'minimum_balance' => fake()->randomFloat(2, 0, 1000),
                'term_months' => $category === 'FIXED_DEPOSIT' ? fake()->randomElement([6, 12, 24, 36]) : null,
            ],
            'is_system' => false,
            'status' => true,
        ];
    }

    public function newModel(array $attributes = []): DepositProduct|LoanProduct
    {
        $attributes['organization_id'] ??= Organization::factory();
        $category = $attributes['category'] ?? 'SAVINGS';
        $interestRate = $attributes['interest_rate'] ?? $attributes['base_interest_rate'] ?? fake()->randomFloat(6, 1, 18);

        if ($category === 'LOAN') {
            unset($attributes['category']);
            return new LoanProduct([
                ...$attributes,
                'interest_rate' => $interestRate,
                'balance_type' => $attributes['balance_type'] ?? 'ASSET',
            ]);
        }

        return new DepositProduct($attributes);
    }

    public function configure(): static
    {
        return $this->afterCreating(function (DepositProduct|LoanProduct $product): void {
            if (!$product instanceof DepositProduct) {
                return;
            }

            $rate = $product->interest_frequency === 'NONE' ? 0 : fake()->randomFloat(6, 1, 18);
            $product->terms()->updateOrCreate(
                ['code' => 'BASE'],
                [
                    'name' => 'Base term',
                    'tenure_value' => 1,
                    'tenure_unit' => 'MONTH',
                    'interest_rate' => $rate,
                    'interest_calculation' => $product->interest_calculation,
                    'interest_frequency' => $product->interest_frequency,
                    'status' => true,
                ],
            );
        });
    }

    public function loan(): static
    {
        return $this->state(fn() => [
            'category' => 'LOAN',
            'balance_type' => 'ASSET',
            'interest_calculation' => 'REDUCING_BALANCE',
            'interest_frequency' => 'MONTHLY',
            'interest_rate' => 12,
        ]);
    }

    public function savings(): static
    {
        return $this->state(fn() => [
            'category' => 'SAVINGS',
            'balance_type' => 'LIABILITY',
            'interest_calculation' => 'SIMPLE',
            'interest_frequency' => 'MONTHLY',
        ]);
    }
}
