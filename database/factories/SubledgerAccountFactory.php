<?php

namespace Database\Factories;

use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SubledgerAccountFactory extends Factory
{
    protected $model = SubledgerAccount::class;

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

            'status' => $this->faker->randomElement([
                'pending',
                'active',
                'dormant',
                'frozen',
                'closed',
            ]),
        ];
    }
}