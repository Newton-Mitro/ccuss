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

            // Polymorphic subledger (optional)
            'subledger_id' => null,
            'subledger_type' => null,

            // Polymorphic reference (optional)
            'reference_id' => null,
            'reference_type' => null,

            // Instrument details (optional)
            'instrument_type' => null,
            'instrument_no' => null,

            'particulars' => $this->faker->optional()->sentence(),

            // ✅ Strict XOR (never both, never zero)
            'debit' => $isDebit ? $amount : 0,
            'credit' => $isDebit ? 0 : $amount,
        ];
    }

    /* =========================================
     |  Helpful States (Optional but Powerful)
     ========================================= */

    public function debit(float $amount = null): static
    {
        $amount ??= $this->faker->randomFloat(2, 100, 1000);

        return $this->state(fn() => [
            'debit' => $amount,
            'credit' => 0,
        ]);
    }

    public function credit(float $amount = null): static
    {
        $amount ??= $this->faker->randomFloat(2, 100, 1000);

        return $this->state(fn() => [
            'debit' => 0,
            'credit' => $amount,
        ]);
    }
}