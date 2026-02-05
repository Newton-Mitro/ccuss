<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerIntroducer;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerIntroducerFactory extends Factory
{
    protected $model = CustomerIntroducer::class;

    public function definition(): array
    {
        return [
            'introduced_customer_id' => Customer::factory(),
            'introducer_customer_id' => Customer::factory(),
            'relationship_type' => $this->faker->randomElement([
                'FRIEND',
                'RELATIVE',
                'BUSINESS'
            ]),
            'verification_status' => 'PENDING',
            'remarks' => $this->faker->sentence(),
        ];
    }
}
