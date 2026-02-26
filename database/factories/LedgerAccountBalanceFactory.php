<?php

namespace Database\Factories;

use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\LedgerAccountBalance;
use App\Accounting\Models\FiscalPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

class LedgerAccountBalanceFactory extends Factory
{
    protected $model = LedgerAccountBalance::class;

    public function definition()
    {
        $opening = $this->faker->randomFloat(2, 0, 5000);
        $debit = $this->faker->randomFloat(2, 0, 2000);
        $credit = $this->faker->randomFloat(2, 0, 2000);
        $closing = $opening + $debit - $credit;

        return [
            'ledger_account_id' => LedgerAccount::factory(),
            'fiscal_period_id' => FiscalPeriod::factory(),
            'opening_balance' => $opening,
            'debit_total' => $debit,
            'credit_total' => $credit,
            'closing_balance' => $closing,
        ];
    }
}
