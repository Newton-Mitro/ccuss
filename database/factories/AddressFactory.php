<?php

namespace Database\Factories;

use App\CostomerManagement\Address\Models\Address;
use App\CostomerManagement\Customer\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::inRandomOrder()->value('id') ?? Customer::factory(),
            'line1' => $this->faker->streetAddress(),
            'line2' => $this->faker->optional()->secondaryAddress(),
            'division' => $this->faker->state(),
            'district' => $this->faker->city(),
            'upazila' => $this->faker->optional()->citySuffix(),
            'union_ward' => $this->faker->optional()->citySuffix(),
            'village_locality' => $this->faker->optional()->streetName(),
            'postal_code' => $this->faker->postcode(),
            'country_code' => 'BD',
            'type' => $this->faker->randomElement(['CURRENT', 'PERMANENT', 'WORK', 'MAILING']),
        ];
    }
}
