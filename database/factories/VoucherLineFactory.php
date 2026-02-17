<?php

namespace Database\Factories;

use App\Accounting\Models\VoucherLine;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherLineFactory extends Factory
{
    protected $model = VoucherLine::class;

    public function definition()
    {
        $debit = $this->faker->randomFloat(2, 0, 1000);
        $credit = $debit > 0 ? 0 : $this->faker->randomFloat(2, 0, 1000);

        return [
            'voucher_id' => null, // assign manually
            'account_id' => null, // assign manually
            'subledger_id' => null,
            'subledger_type' => null,
            'associate_ledger_id' => null,
            'narration' => $this->faker->optional()->sentence(),
            'debit' => $debit,
            'credit' => $credit,
        ];
    }
}
