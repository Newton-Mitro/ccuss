<?php

namespace Database\Factories;

use App\CustomerModule\Models\CustomerAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    public function definition(): array
    {
        return [
            'line1' => fake()->streetAddress(),
            'line2' => fake()->optional()->secondaryAddress(),
            'division' => fake()->randomElement(['Dhaka', 'Chattogram', 'Khulna']),
            'district' => fake()->city(),
            'upazila' => fake()->citySuffix(),
            'union_ward' => fake()->word(),
            'postal_code' => fake()->postcode(),
            'country' => 'Bangladesh',
            'type' => fake()->randomElement([
                'CURRENT',
                'PERMANENT',
                'WORK',
                'MAILING'
            ]),
        ];
    }
}
