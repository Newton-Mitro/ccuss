<?php

namespace Database\Factories;

use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherLineFactory extends Factory
{
    protected $model = VoucherLine::class;

    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 100, 1000);
        $isDebit = $this->faker->boolean();

        return [
            'voucher_id' => Voucher::factory(),
            'ledger_account_id' => LedgerAccount::factory(),

            'subledger_id' => null,
            'subledger_type' => null,
            'associate_ledger_id' => null,

            'particulars' => $this->faker->optional()->sentence(),

            // ✅ XOR enforced
            'debit' => $isDebit ? $amount : 0,
            'credit' => $isDebit ? 0 : $amount,
        ];
    }
}
