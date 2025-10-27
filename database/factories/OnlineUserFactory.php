<?php

namespace Database\Factories;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\OnlineUser\Models\OnlineUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class OnlineUserFactory extends Factory
{
    protected $model = OnlineUser::class;

    public function definition(): array
    {
        $customer = Customer::inRandomOrder()->first() ?? Customer::factory()->create();

        return [
            'customer_id' => $customer->id,
            'username' => strtolower($this->faker->unique()->userName()),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->unique()->phoneNumber(),
            'password' => Hash::make('password'),
            'last_login_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'status' => $this->faker->randomElement(['ACTIVE', 'SUSPENDED', 'CLOSED']),
        ];
    }
}
