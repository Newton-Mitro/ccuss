<?php

namespace Database\Factories;

use App\Accounting\Models\AccountBalance;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountBalanceFactory extends Factory
{
    protected $model = AccountBalance::class;

    public function definition()
    {
        $opening = $this->faker->randomFloat(2, 0, 5000);
        $debit = $this->faker->randomFloat(2, 0, 2000);
        $credit = $this->faker->randomFloat(2, 0, 2000);
        $closing = $opening + $debit - $credit;

        return [
            'account_id' => null, // assign manually
            'fiscal_period_id' => null, // assign manually
            'opening_balance' => $opening,
            'debit_total' => $debit,
            'credit_total' => $credit,
            'closing_balance' => $closing,
        ];
    }
}
