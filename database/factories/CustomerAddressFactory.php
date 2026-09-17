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
            'PENDING',
            'VERIFIED',
            'REJECTED',
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
                'CURRENT',
                'PERMANENT',
                'MAILING',
                'WORK',
                'REGISTERED',
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

    public function current(): static
    {
        return $this->state(fn() => [
            'type' => 'CURRENT',
        ]);
    }

    public function permanent(): static
    {
        return $this->state(fn() => [
            'type' => 'PERMANENT',
        ]);
    }

    public function mailing(): static
    {
        return $this->state(fn() => [
            'type' => 'MAILING',
        ]);
    }

    public function work(): static
    {
        return $this->state(fn() => [
            'type' => 'WORK',
        ]);
    }

    public function registered(): static
    {
        return $this->state(fn() => [
            'type' => 'REGISTERED',
        ]);
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
}