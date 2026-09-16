<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\AccountGroup;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountGroupFactory extends Factory
{
    protected $model = AccountGroup::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);

        return [
            'organization_id' => Organization::factory(),
            'parent_id' => null,
            'code' => (string) fake()->unique()->numberBetween(1000, 9999),
            'name' => fake()->unique()->words(2, true),
            'type' => $type,
            'normal_balance' => in_array($type, ['ASSET', 'EXPENSE'], true) ? 'DEBIT' : 'CREDIT',
            'level' => 0,
            'is_system' => false,
            'status' => true,
        ];
    }
}
