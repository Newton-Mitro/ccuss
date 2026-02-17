<?php

namespace Database\Factories;

use App\Accounting\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition()
    {
        $types = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
        return [
            'code' => $this->faker->unique()->numerify('1###'),
            'name' => $this->faker->word() . ' Account',
            'type' => $this->faker->randomElement($types),
            'is_control_account' => $this->faker->boolean(30),
            'is_active' => true,
            'is_leaf' => true,
            'parent_id' => null, // assign manually for tree hierarchy
        ];
    }
}
