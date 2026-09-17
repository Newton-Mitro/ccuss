<?php

namespace Database\Factories;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialTransactionFactory extends Factory
{
    protected $model = FinancialTransaction::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'branch_id' => null,
            'financial_account_id' => FinancialAccount::factory(),
            'transaction_no' => strtoupper(fake()->unique()->bothify('FT-########')),
            'transaction_type' => fake()->randomElement(['DEPOSIT', 'WITHDRAWAL']),
            'transaction_date' => now()->subDays(fake()->numberBetween(0, 90)),
            'amount' => fake()->randomFloat(4, 100, 50000),
            'currency' => 'BDT',
            'status' => 'PENDING',
            'reference' => fake()->optional()->bothify('REF-########'),
            'description' => fake()->sentence(),
            'source_type' => null,
            'source_id' => null,
            'created_by' => null,
            'posted_by' => null,
            'posted_at' => null,
        ];
    }

    public function deposit(): static
    {
        return $this->state(fn() => ['transaction_type' => 'DEPOSIT']);
    }

    public function withdrawal(): static
    {
        return $this->state(fn() => ['transaction_type' => 'WITHDRAWAL']);
    }

    public function posted(): static
    {
        return $this->state(fn() => ['status' => 'POSTED', 'posted_at' => now()]);
    }

    public function reversed(): static
    {
        return $this->state(fn() => ['status' => 'REVERSED']);
    }
}
