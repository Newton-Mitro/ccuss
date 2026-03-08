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
        $prefix = $type === 'Individual' ? 'IND' : 'ORG';

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

            'name' => $type === 'Individual'
                ? $this->faker->name()
                : $this->faker->company(),

            'phone' => $type === 'Individual'
                ? $this->faker->phoneNumber()
                : null,

            'email' => $type === 'Individual'
                ? $this->faker->safeEmail()
                : null,

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

            // Identification
            'identification_type' => $type === 'Individual'
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