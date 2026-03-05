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

            // Polymorphic subledger (optional: e.g., Customer, Vendor, DepositAccount)
            'subledger_id' => null,
            'subledger_type' => null,

            // Polymorphic reference (optional: e.g., Invoice, Cheque)
            'reference_id' => null,
            'reference_type' => null,

            // Instrument details (optional)
            'instrument_type_id' => null,
            'instrument_id' => null,

            'particulars' => $this->faker->optional()->sentence(),

            // Debit/Credit XOR logic
            'debit' => $isDebit ? $amount : 0,
            'credit' => $isDebit ? 0 : $amount,
            'dr_cr' => $isDebit ? 'DR' : 'CR',

            'created_at' => now(),
            'updated_at' => now(),
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
            'dr_cr' => 'DR',
        ]);
    }

    public function credit(float $amount = null): static
    {
        $amount ??= $this->faker->randomFloat(2, 100, 1000);

        return $this->state(fn() => [
            'debit' => 0,
            'credit' => $amount,
            'dr_cr' => 'CR',
        ]);
    }
}