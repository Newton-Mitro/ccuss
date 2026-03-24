<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\CashAdjustment;
use App\BranchTreasuryModule\Models\TellerSession;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashAdjustmentFactory extends Factory
{
    protected $model = CashAdjustment::class;

    public function definition(): array
    {
        return [
            'teller_session_id' => TellerSession::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 1000),
            'type' => $this->faker->randomElement(['shortage', 'excess']),
            'reason' => $this->faker->sentence(),
            'approved_by' => User::factory(),
        ];
    }
}