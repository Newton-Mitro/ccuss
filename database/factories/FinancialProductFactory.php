<?php

namespace Database\Factories;

use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialProductFactory extends Factory
{
    protected $model = FinancialProduct::class;

    public function definition(): array
    {
        $category = fake()->randomElement(['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'OTHER']);
        $isLoan = $category === 'LOAN';
        $hasInterest = !$isLoan || fake()->boolean(70);

        return [
            'organization_id' => Organization::factory(),
            'code' => strtoupper(fake()->unique()->bothify('???-###')),
            'name' => fake()->unique()->words(2, true),
            'category' => $category,
            'balance_type' => $isLoan ? 'ASSET' : fake()->randomElement(['LIABILITY', 'EQUITY']),
            'interest_rate' => $hasInterest ? fake()->randomFloat(6, 1, 18) : 0,
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

    public function loan(): static
    {
        return $this->state(fn() => [
            'category' => 'LOAN',
            'balance_type' => 'ASSET',
            'interest_calculation' => 'REDUCING_BALANCE',
            'interest_frequency' => 'MONTHLY',
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
