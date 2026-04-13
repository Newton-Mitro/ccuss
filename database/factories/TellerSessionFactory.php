<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\BranchDay;
use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\TellerSession;
use Illuminate\Database\Eloquent\Factories\Factory;

class TellerSessionFactory extends Factory
{
    protected $model = TellerSession::class;

    public function definition(): array
    {
        $teller = Teller::factory()->create();

        return [
            'teller_id' => $teller->id,
            'branch_id' => $teller->branch_id, // ✅ keep consistent
            'branch_day_id' => BranchDay::factory()->create([
                'branch_id' => $teller->branch_id,
            ])->id,

            // 🔥 Critical: must match a real account
            'cash_account_id' => $teller->account_id,

            // Session lifecycle
            'opened_at' => now(),
            'closed_at' => null,
            'status' => 'open',

            // Cash snapshot
            'opening_cash' => $this->faker->randomFloat(2, 1000, 50000),
            'closing_cash' => null,

            // System fields (nullable at open)
            'expected_balance' => null,
            'difference' => null,

            'adjustment_transaction_id' => null,
            'remarks' => null,
        ];
    }
}