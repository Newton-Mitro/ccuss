<?php

namespace Database\Factories;

use App\CustomerModule\Models\OnlineServiceClient;
use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class OnlineServiceClientFactory extends Factory
{
    protected $model = OnlineServiceClient::class;

    public function definition(): array
    {
        // Pick a random customer
        $customer = Customer::inRandomOrder()->first();

        // Pick a random existing user for audit
        $creator = User::inRandomOrder()->first();

        return [
            'organization_id' => $customer->organization_id ?? null,
            'branch_id' => $customer->branch_id ?? null,
            'customer_id' => $customer->id ?? null,

            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->phoneNumber(),
            'password' => Hash::make('password'),
            'status' => 'ACTIVE',

            'created_by' => $creator->id ?? null,
            'updated_by' => $creator->id ?? null,
        ];
    }

    /**
     * State for pending status
     */
    public function pending()
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'PENDING',
        ]);
    }

    /**
     * State for suspended status
     */
    public function suspended()
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'SUSPENDED',
        ]);
    }
}