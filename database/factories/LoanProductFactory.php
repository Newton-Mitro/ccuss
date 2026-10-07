<?php

namespace Database\Factories;

use App\FinancialServices\Models\LoanProduct;

class LoanProductFactory extends FinancialProductFactory
{
    protected $model = LoanProduct::class;

    public function definition(): array
    {
        return [...parent::definition(), 'category' => 'LOAN'];
    }
}