<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\GeneralAccounting\Models\VoucherEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherEntryFactory extends Factory
{
    protected $model = VoucherEntry::class;

    public function definition(): array
    {
        return [
            'voucher_id' => Voucher::factory(),
            'account_id' => LedgerAccount::factory(),
            'branch_id' => null,
            'cost_center_id' => null,
            'financial_account_id' => null,
            'description' => fake()->sentence(),
            'debit' => 0,
            'credit' => fake()->randomFloat(4, 1, 1000),
            'reference' => null,
            'line_no' => 1,
        ];
    }

    public function debit(float $amount): static
    {
        return $this->state(fn(array $attributes) => [
            'debit' => $amount,
            'credit' => 0,
        ]);
    }

    public function credit(float $amount): static
    {
        return $this->state(fn(array $attributes) => [
            'debit' => 0,
            'credit' => $amount,
        ]);
    }
}
