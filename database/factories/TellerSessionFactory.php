<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\BranchDay;
use App\BranchTreasuryModule\Models\Teller;
use Illuminate\Database\Eloquent\Factories\Factory;

class TellerSessionFactory extends Factory
{
    protected $model = \App\Models\TellerSession::class;

    public function definition(): array
    {
        return [
            'teller_id' => Teller::factory(),
            'branch_day_id' => BranchDay::factory(),
            'opening_cash' => $this->faker->randomFloat(2, 1000, 50000),
            'closing_cash' => null,
            'opened_at' => now(),
            'closed_at' => null,
            'status' => 'open',
        ];
    }
}