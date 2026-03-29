<?php

namespace Database\Factories;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BranchFactory extends Factory
{
    protected $model = Branch::class;



    public function definition(): array
    {
        $name = fake()->company();

        return [
            'organization_id' => Organization::factory(),
            'code' => strtoupper(fake()->unique()->bothify('DHK###')),
            'name' => $name,
            'address' => fake()->streetAddress . ', ' . $name,
            'latitude' => fake()->latitude(23.4, 24.5),
            'longitude' => fake()->longitude(89.5, 91.5),
            'manager_id' => User::query()->inRandomOrder()->value('id'),
        ];
    }
}
