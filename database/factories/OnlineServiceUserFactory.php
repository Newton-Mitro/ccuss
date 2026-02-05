<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\OnlineServiceUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class OnlineServiceUserFactory extends Factory
{
    protected $model = OnlineServiceUser::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'username' => $this->faker->unique()->userName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'password' => Hash::make('password'),
            'status' => 'ACTIVE',
        ];
    }
}
