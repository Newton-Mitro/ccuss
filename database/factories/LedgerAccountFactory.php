<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class LedgerAccountFactory extends Factory
{
    protected $model = LedgerAccount::class;

    public function definition(): array
    {
        $types = ['asset', 'liability', 'equity', 'income', 'expense'];

        $isControl = fake()->boolean(30); // 30% chance to be control account

        return [
            'organization_id' => Organization::factory(),

            'code' => fake()->unique()->numerify('1###'),
            'name' => ucfirst(fake()->word()) . ' Account',
            'type' => fake()->randomElement($types),
            'is_control_account' => $isControl,
            'is_active' => true,
            'is_leaf' => !$isControl, // control accounts are never leaf
            'parent_id' => null, // assign manually if needed
        ];
    }
}