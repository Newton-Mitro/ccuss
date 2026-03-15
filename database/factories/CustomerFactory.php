<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
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

        // Pick a random organization and branch
        $organization = Organization::inRandomOrder()->first();
        $branch = $organization ? $organization->branches()->inRandomOrder()->first() : null;
        $creator = User::inRandomOrder()->first();

        return [
            'organization_id' => $organization->id ?? null,
            'branch_id' => $branch->id ?? null,

            'customer_no' => sprintf('%s-%05d', $prefix, $this->faker->unique()->numberBetween(1, 99999)),
            'type' => $type,
            'name' => $name,
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),
            'dob' => $type === 'INDIVIDUAL'
                ? $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d')
                : null,
            'gender' => $gender,
            'religion' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])
                : null,
            'identification_type' => $type === 'INDIVIDUAL'
                ? $this->faker->randomElement($individualIds)
                : $this->faker->randomElement($organizationIds),
            'identification_number' => strtoupper(Str::random(12)),
            'kyc_status' => 'PENDING',
            'created_by' => $creator->id ?? null,
            'updated_by' => $creator->id ?? null,
        ];
    }

    public function individualMale()
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'INDIVIDUAL',
            'gender' => 'MALE',
            'name' => $this->faker->firstNameMale() . ' ' . $this->faker->lastName(),
            'customer_no' => 'IND-' . $this->faker->unique()->numberBetween(1, 99999),
            'dob' => $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
            'religion' => $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
            'identification_type' => $this->faker->randomElement(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE']),
        ]);
    }

    public function individualFemale()
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'INDIVIDUAL',
            'gender' => 'FEMALE',
            'name' => $this->faker->firstNameFemale() . ' ' . $this->faker->lastName(),
            'customer_no' => 'IND-' . $this->faker->unique()->numberBetween(1, 99999),
            'dob' => $this->faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
            'religion' => $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
            'identification_type' => $this->faker->randomElement(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE']),
        ]);
    }

    public function organization()
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'ORGANIZATION',
            'gender' => null,
            'name' => $this->faker->company(),
            'customer_no' => 'ORG-' . $this->faker->unique()->numberBetween(1, 99999),
            'identification_type' => 'REGISTRATION_NO',
        ]);
    }
}