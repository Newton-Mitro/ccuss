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
        $type = fake()->randomElement(['INDIVIDUAL', 'ORGANIZATION']);

        $gender = $type === 'INDIVIDUAL'
            ? fake()->randomElement(['MALE', 'FEMALE', 'OTHER', null])
            : null;

        $name = $type === 'ORGANIZATION'
            ? fake()->company()
            : match ($gender) {
                'MALE' => fake()->firstNameMale() . ' ' . fake()->lastName(),
                'FEMALE' => fake()->firstNameFemale() . ' ' . fake()->lastName(),
                default => fake()->name(),
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

            'customer_no' => sprintf('%s-%05d', $prefix, fake()->unique()->numberBetween(1, 99999)),
            'type' => $type,
            'name' => $name,
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'dob' => $type === 'INDIVIDUAL'
                ? fake()->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d')
                : null,
            'gender' => $gender,
            'religion' => $type === 'INDIVIDUAL'
                ? fake()->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])
                : null,
            'identification_type' => $type === 'INDIVIDUAL'
                ? fake()->randomElement($individualIds)
                : fake()->randomElement($organizationIds),
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
            'name' => fake()->firstNameMale() . ' ' . fake()->lastName(),
            'customer_no' => 'IND-' . fake()->unique()->numberBetween(1, 99999),
            'dob' => fake()->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
            'religion' => fake()->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
            'identification_type' => fake()->randomElement(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE']),
        ]);
    }

    public function individualFemale()
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'INDIVIDUAL',
            'gender' => 'FEMALE',
            'name' => fake()->firstNameFemale() . ' ' . fake()->lastName(),
            'customer_no' => 'IND-' . fake()->unique()->numberBetween(1, 99999),
            'dob' => fake()->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
            'religion' => fake()->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
            'identification_type' => fake()->randomElement(['NID', 'BRN', 'PASSPORT', 'DRIVING_LICENSE']),
        ]);
    }

    public function organization()
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'ORGANIZATION',
            'gender' => null,
            'name' => fake()->company(),
            'customer_no' => 'ORG-' . fake()->unique()->numberBetween(1, 99999),
            'identification_type' => 'REGISTRATION_NO',
        ]);
    }
}