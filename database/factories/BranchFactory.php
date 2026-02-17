<?php

namespace Database\Factories;

use App\Branch\Models\Branch;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('BR###')),
            'name' => $this->faker->company . ' Branch',
            'address' => $this->faker->address,
            'latitude' => $this->faker->latitude(20, 26), // BD range example
            'longitude' => $this->faker->longitude(88, 92),
            'manager_id' => User::query()->inRandomOrder()->value('id'),
        ];
    }
}
