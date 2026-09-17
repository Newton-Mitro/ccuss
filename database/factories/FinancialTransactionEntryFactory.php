<?php

namespace Database\Factories;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\FinancialTransactionEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialTransactionEntryFactory extends Factory
{
    protected $model = FinancialTransactionEntry::class;

    public function definition(): array
    {
        return [
            'financial_transaction_id' => FinancialTransaction::factory(),
            'financial_account_id' => FinancialAccount::factory(),
            'direction' => fake()->randomElement(['DEBIT', 'CREDIT']),
            'amount' => fake()->randomFloat(4, 100, 50000),
            'balance_after' => null,
            'description' => fake()->sentence(),
            'line_no' => 1,
        ];
    }

    public function debit(): static
    {
        return $this->state(fn() => ['direction' => 'DEBIT']);
    }

    public function credit(): static
    {
        return $this->state(fn() => ['direction' => 'CREDIT']);
    }
}
