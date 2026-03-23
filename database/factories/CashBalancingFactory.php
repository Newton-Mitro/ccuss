<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\CashBalancing;
use App\BranchTreasuryModule\Models\TellerSession;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashBalancingFactory extends Factory
{
    protected $model = CashBalancing::class;

    public function definition(): array
    {
        $expected = $this->faker->randomFloat(2, 1000, 50000);
        $actual = $expected + $this->faker->randomFloat(2, -500, 500);

        return [
            'teller_session_id' => TellerSession::factory(),
            'expected_balance' => $expected,
            'actual_balance' => $actual,
            'difference' => $actual - $expected,
            'verified_by' => User::factory(),
            'balanced_at' => now(),
            'remarks' => $this->faker->sentence(),
        ];
    }
}