<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerIntroducer;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerIntroducerFactory extends Factory
{
    protected $model = CustomerIntroducer::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            'PENDING',
            'VERIFIED',
            'REJECTED',
        ]);

        return [
            'introduced_customer_id' => Customer::factory(),

            'introducer_customer_id' => fake()->boolean(85)
                ? Customer::factory()
                : null,

            // Replace with an existing Account model factory if available.
            'introducer_account_id' => null,

            'relationship_type' => fake()->randomElement([
                'FAMILY',
                'FRIEND',
                'BUSINESS',
                'COLLEAGUE',
                'OTHER',
            ]),

            'verification_status' => $status,

            'verified_at' => $status === 'VERIFIED'
                ? fake()->dateTimeBetween('-1 year', 'now')
                : null,

            'remarks' => $status === 'REJECTED'
                ? fake()->sentence()
                : null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'VERIFIED',
            'verified_at' => now(),
            'remarks' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'PENDING',
            'verified_at' => null,
            'remarks' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'REJECTED',
            'verified_at' => null,
            'remarks' => fake()->sentence(),
        ]);
    }

    public function family(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'FAMILY',
        ]);
    }

    public function friend(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'FRIEND',
        ]);
    }

    public function business(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'BUSINESS',
        ]);
    }

    public function colleague(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'COLLEAGUE',
        ]);
    }

    public function other(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'OTHER',
        ]);
    }
}