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
        return [
            'introduced_customer_id' => Customer::factory(),
            'introducer_customer_id' => Customer::factory(),
            'relationship_type' => fake()->randomElement([
                'friend',
                'relative',
                'business'
            ]),
            'verification_status' => 'pending',
            'remarks' => fake()->sentence(),
        ];
    }
}
