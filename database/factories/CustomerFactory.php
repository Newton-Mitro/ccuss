<?php

namespace Database\Factories;

use App\CostomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['INDIVIDUAL', 'ORGANIZATION']);

        $gender = $type === 'INDIVIDUAL'
            ? $this->faker->randomElement(['MALE', 'FEMALE', 'OTHER', null])
            : null;

        $name = $type === 'ORGANIZATION'
            ? $this->faker->company()
            : match ($gender) {
                'MALE' => $this->faker->firstNameMale() . ' ' . $this->faker->lastName(),
                'FEMALE' => $this->faker->firstNameFemale() . ' ' . $this->faker->lastName(),
                default => $this->faker->name(),
            };

        $prefix = $type === 'INDIVIDUAL' ? 'IND' : 'ORG';

        $individualIds = ['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE'];
        $organizationIds = ['REGISTRATION_NO'];

        return [
            'customer_no' => sprintf(
                '%s-%05d',
                $prefix,
                $this->faker->unique()->numberBetween(1, 99999)
            ),

            'type' => $type,

            'name' => $name,

            'phone' => $this->faker->phoneNumber(),

            'email' => $this->faker->safeEmail(),

            'dob' => $type === 'INDIVIDUAL'
                ? $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d')
                : null,

            'gender' => $gender,

            'religion' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement([
                    'CHRISTIANITY',
                    'ISLAM',
                    'HINDUISM',
                    'BUDDHISM',
                    'OTHER'
                ])
                : null,

            'identification_type' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement($individualIds)
                : $this->faker->randomElement($organizationIds),

            'identification_number' => strtoupper(Str::random(12)),

            'kyc_status' => 'PENDING',

            'created_by' => null,
            'updated_by' => null,
        ];
    }



    public function individualMale()
    {
        return $this->state(function () {
            return [
                'name' => $this->faker->firstNameMale() . ' ' . $this->faker->lastName(),
                'type' => 'INDIVIDUAL',
                'gender' => 'MALE',
                'customer_no' => 'IND-' . fake()->unique()->numberBetween(1, 99999),
                'dob' => $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
                'religion' => $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
                'identification_type' => $this->faker->randomElement(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE']),
            ];
        });
    }

    public function individualFemale()
    {
        return $this->state(function () {
            return [
                'name' => $this->faker->firstNameFemale() . ' ' . $this->faker->lastName(),
                'type' => 'INDIVIDUAL',
                'gender' => 'FEMALE',
                'customer_no' => 'IND-' . fake()->unique()->numberBetween(1, 99999),
                'dob' => $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
                'religion' => $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
                'identification_type' => $this->faker->randomElement(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE']),
            ];
        });
    }

    public function organization()
    {
        return $this->state(function () {
            return [
                'name' => $this->faker->company(),
                'type' => 'ORGANIZATION',
                'gender' => null,
                'customer_no' => 'ORG-' . fake()->unique()->numberBetween(1, 99999),
                'identification_type' => $this->faker->randomElement(['REGISTRATION_NO']),
            ];
        });
    }
}
