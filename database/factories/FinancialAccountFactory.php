<?php

namespace Database\Factories;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialAccountFactory extends Factory
{
    protected $model = FinancialAccount::class;

    public function definition(): array
    {
        $accountType = fake()->randomElement(['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CASH', 'BANK', 'OTHER']);

        return [
            'organization_id' => Organization::factory(),
            'branch_id' => null,
            'financial_product_id' => FinancialProduct::factory(),
            'holder_type' => null,
            'holder_id' => null,
            'account_no' => strtoupper(fake()->unique()->bothify('FA-########')),
            'name' => fake()->name(),
            'account_type' => $accountType,
            'status' => 'PENDING',
            'balance' => 0,
            'available_balance' => 0,
            'interest_accrued' => 0,
            'opened_at' => null,
            'closed_at' => null,
            'metadata' => [],
        ];
    }

    public function active(float $balance = 0): static
    {
        return $this->state(fn() => [
            'status' => 'ACTIVE',
            'balance' => $balance,
            'available_balance' => $balance,
            'opened_at' => now()->toDateString(),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn() => [
            'status' => 'CLOSED',
            'opened_at' => now()->subYear()->toDateString(),
            'closed_at' => now()->toDateString(),
        ]);
    }
}
