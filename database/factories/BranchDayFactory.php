<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\BranchDay;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BranchDayFactory extends Factory
{
    protected $model = BranchDay::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'business_date' => $this->faker->date(),
            'opened_at' => now(),
            'closed_at' => null,
            'opened_by' => User::factory(),
            'closed_by' => null,
            'status' => 'open',
        ];
    }
}