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
        $type = $this->faker->randomElement(['INDIVIDUAL', 'ORGANIZATION']);
        $prefix = $type === 'INDIVIDUAL' ? 'IND' : 'ORG';

        // Identification types
        $individualIds = ['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE'];
        $organizationIds = ['REGISTRATION_NO', 'BRN'];

        return [
            'customer_no' => sprintf(
                '%s-%05d',
                $prefix,
                $this->faker->unique()->numberBetween(1, 99999)
            ),

            'type' => $type,

            'name' => $type === 'INDIVIDUAL'
                ? $this->faker->name()
                : $this->faker->company(),

            'phone' => $this->faker->phoneNumber(),

            'email' => $this->faker->safeEmail(),

            // Individual-only fields
            'dob' => $type === 'INDIVIDUAL'
                ? $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d')
                : null,

            'gender' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement(['MALE', 'FEMALE', 'OTHER'])
                : null,

            'religion' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement([
                    'CHRISTIANITY',
                    'ISLAM',
                    'HINDUISM',
                    'BUDDHISM',
                    'OTHER'
                ])
                : null,

            // Identification
            'identification_type' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement($individualIds)
                : $this->faker->randomElement($organizationIds),

            'identification_number' => strtoupper(Str::random(12)),
            'kyc_status' => 'PENDING', // default status

            // Audit fields can be null
            'created_by' => null,
            'updated_by' => null,
        ];
    }
}