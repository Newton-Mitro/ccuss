<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['Individual', 'Organization']);

        return [
            'customer_no' => 'CUST-' . $this->faker->unique()->numerify('#####'),

            'type' => $type,

            'name' => $type === 'Individual'
                ? $this->faker->name()
                : $this->faker->company(),

            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),

            // Individual-only fields
            'dob' => $type === 'Individual'
                ? $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d')
                : null,

            'gender' => $type === 'Individual'
                ? $this->faker->randomElement(['MALE', 'FEMALE', 'OTHER'])
                : null,

            'religion' => $type === 'Individual'
                ? $this->faker->randomElement([
                    'CHRISTIANITY',
                    'ISLAM',
                    'HINDUISM',
                    'BUDDHISM',
                    'OTHER'
                ])
                : null,

            // Identification (required for both)
            'identification_type' => $this->faker->randomElement([
                'NID',
                'BRN',
                'REGISTRATION_NO',
                'PASSPORT',
                'DRIVING_LICENSE'
            ]),

            'identification_number' => strtoupper(Str::random(12)),

            // KYC + lifecycle
            'kyc_level' => $this->faker->randomElement(['MIN', 'STD', 'ENH']),
            'status' => $this->faker->randomElement([
                'PENDING',
                'ACTIVE',
                'SUSPENDED',
                'CLOSED'
            ]),
        ];
    }
}