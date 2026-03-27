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
            'is_active' => true,
        ];
    }
}