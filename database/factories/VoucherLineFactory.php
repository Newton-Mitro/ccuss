<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\FinanceAndAccounting\Models\Voucher;
use App\FinanceAndAccounting\Models\VoucherLine;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherLineFactory extends Factory
{
    protected $model = VoucherLine::class;

    public function definition(): array
    {
        // Create organization
        $organization = Organization::factory()->create();

        // Create voucher and ledger account in the same organization
        $voucher = Voucher::factory()->create(['organization_id' => $organization->id]);
        $ledgerAccount = LedgerAccount::factory()->create(['organization_id' => $organization->id]);

        $amount = fake()->randomFloat(2, 100, 1000);
        $isDebit = fake()->boolean();

        return [
            'voucher_id' => $voucher->id,
            'ledger_account_id' => $ledgerAccount->id,

            // Polymorphic subledger (optional)
            'subledger_id' => null,
            'subledger_type' => null,

            // Polymorphic reference (optional)
            'reference_id' => null,
            'reference_type' => null,

            // Instrument details (optional)
            'instrument_type_id' => null,
            'instrument_id' => null,

            'particulars' => fake()->optional()->sentence(),

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
        $amount ??= fake()->randomFloat(2, 100, 1000);

        return $this->state(fn() => [
            'debit' => $amount,
            'credit' => 0,
            'dr_cr' => 'DR',
        ]);
    }

    public function credit(float $amount = null): static
    {
        $amount ??= fake()->randomFloat(2, 100, 1000);

        return $this->state(fn() => [
            'debit' => 0,
            'credit' => $amount,
            'dr_cr' => 'CR',
        ]);
    }
}