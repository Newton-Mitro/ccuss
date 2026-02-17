<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'line1' => $this->faker->streetAddress(),
            'line2' => $this->faker->optional()->secondaryAddress(),
            'division' => $this->faker->randomElement(['Dhaka', 'Chattogram', 'Khulna']),
            'district' => $this->faker->city(),
            'upazila' => $this->faker->citySuffix(),
            'union_ward' => $this->faker->word(),
            'postal_code' => $this->faker->postcode(),
            'country' => 'Bangladesh',
            'type' => $this->faker->randomElement([
                'CURRENT',
                'PERMANENT',
                'WORK',
                'MAILING'
            ]),
            'verification_status' => 'PENDING',
        ];
    }
}
