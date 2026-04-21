<?php

namespace Database\Factories;

use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaultFactory extends Factory
{
    protected $model = \App\Models\Vault::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'subledger_account_id' => SubledgerAccount::factory(),
            'name' => 'Vault ' . $this->faker->unique()->word(),
            'is_active' => $this->faker->boolean(90), // mostly active by default
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn() => [
            'is_active' => false,
        ]);
    }
}