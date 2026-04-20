<?php

namespace Database\Factories;

use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'branch_id' => Branch::factory(),

            // polymorphic (default = no owner)
            'accountable_id' => null,
            'accountable_type' => null,

            'account_number' => strtoupper('ACC-' . Str::random(10)),
            'name' => $this->faker->words(3, true),

            'type' => $this->faker->randomElement([
                'bank',
                'deposit',
                'loan',
                'petty_cash',
                'vendor',
                'vault',
                'teller',
                'customer',
            ]),

            'status' => $this->faker->randomElement([
                'pending',
                'active',
                'dormant',
                'frozen',
                'closed',
            ]),
        ];
    }

    public function vault(): static
    {
        return $this->state(fn() => [
            'type' => 'vault',
            'status' => 'active',
        ]);
    }

    public function teller(): static
    {
        return $this->state(fn() => [
            'type' => 'teller',
            'status' => 'active',
        ]);
    }
}