<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            'pending',
            'verified',
            'rejected',
        ]);

        return [
            'customer_id' => Customer::factory(),

            'line1' => fake()->streetAddress(),
            'line2' => fake()->optional()->secondaryAddress(),

            'division' => fake()->randomElement([
                'Dhaka',
                'Chattogram',
                'Khulna',
                'Rajshahi',
                'Sylhet',
                'Barishal',
                'Rangpur',
                'Mymensingh',
            ]),

            'district' => fake()->city(),
            'upazila' => fake()->citySuffix(),
            'union_ward' => fake()->streetName(),
            'postal_code' => fake()->postcode(),

            'country' => 'Bangladesh',

            'type' => fake()->randomElement([
                'current',
                'permanent',
                'mailing',
                'work',
                'registered',
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

    public function current(): static
    {
        return $this->state(fn() => [
            'type' => 'current',
        ]);
    }

    public function permanent(): static
    {
        return $this->state(fn() => [
            'type' => 'permanent',
        ]);
    }

    public function mailing(): static
    {
        return $this->state(fn() => [
            'type' => 'mailing',
        ]);
    }

    public function work(): static
    {
        return $this->state(fn() => [
            'type' => 'work',
        ]);
    }

    public function registered(): static
    {
        return $this->state(fn() => [
            'type' => 'registered',
        ]);
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
}