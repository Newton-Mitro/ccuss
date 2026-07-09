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
            'pending',
            'verified',
            'rejected',
        ]);

        return [
            'introduced_customer_id' => Customer::factory(),

            'introducer_customer_id' => fake()->boolean(85)
                ? Customer::factory()
                : null,

            // Replace with an existing Account model factory if available.
            'introducer_account_id' => null,

            'relationship_type' => fake()->randomElement([
                'family',
                'friend',
                'business',
                'colleague',
                'other',
            ]),

            'verification_status' => $status,

            'verified_at' => $status === 'verified'
                ? fake()->dateTimeBetween('-1 year', 'now')
                : null,

            'remarks' => $status === 'rejected'
                ? fake()->sentence()
                : null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'verified',
            'verified_at' => now(),
            'remarks' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'pending',
            'verified_at' => null,
            'remarks' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'rejected',
            'verified_at' => null,
            'remarks' => fake()->sentence(),
        ]);
    }

    public function family(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'family',
        ]);
    }

    public function friend(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'friend',
        ]);
    }

    public function business(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'business',
        ]);
    }

    public function colleague(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'colleague',
        ]);
    }

    public function other(): static
    {
        return $this->state(fn() => [
            'relationship_type' => 'other',
        ]);
    }
}