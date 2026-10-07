<?php

namespace Database\Factories;

use App\FinancialServices\Models\DepositProduct;

class DepositProductFactory extends FinancialProductFactory
{
    protected $model = DepositProduct::class;

    public function definition(): array
    {
        return [...parent::definition(), 'category' => 'SAVINGS'];
    }
}