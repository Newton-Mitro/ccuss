<?php

namespace Database\Factories;

use App\SystemAdministration\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaultFactory extends Factory
{
    protected $model = \App\Models\Vault::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'name' => 'Vault ' . $this->faker->unique()->word(),
            'total_balance' => $this->faker->randomFloat(2, 10000, 1000000),
            'is_active' => true,
        ];
    }
}