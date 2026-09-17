<?php

namespace Database\Factories;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialProductAccountMappingFactory extends Factory
{
    protected $model = FinancialProductAccountMapping::class;

    public function definition(): array
    {
        return [
            'financial_product_id' => FinancialProduct::factory(),
            'transaction_type' => fake()->randomElement(['DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'DISBURSEMENT', 'REPAYMENT']),
            'debit_account_id' => LedgerAccount::factory(),
            'credit_account_id' => LedgerAccount::factory(),
            'status' => true,
        ];
    }

    public function forTransaction(string $transactionType): static
    {
        return $this->state(fn() => ['transaction_type' => strtoupper($transactionType)]);
    }
}
