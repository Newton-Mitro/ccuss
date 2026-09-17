<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['INDIVIDUAL', 'ORGANIZATION']);

        $gender = $type === 'INDIVIDUAL'
            ? fake()->randomElement(['MALE', 'FEMALE', 'OTHER'])
            : null;

        $name = $type === 'ORGANIZATION'
            ? fake()->company()
            : match ($gender) {
                'MALE' => fake()->firstNameMale() . ' ' . fake()->lastName(),
                'FEMALE' => fake()->firstNameFemale() . ' ' . fake()->lastName(),
                default => fake()->name(),
            };

        $organization = Organization::query()
            ->with('branches')
            ->inRandomOrder()
            ->first();

        $branch = $organization?->branches->random();

        return [
            'organization_id' => $organization?->id,
            'branch_id' => $branch?->id,

            'customer_no' => sprintf(
                '%s-%06d',
                $type === 'INDIVIDUAL' ? 'IND' : 'ORG',
                fake()->unique()->numberBetween(1, 999999)
            ),

            'type' => $type,

            'name' => $name,

            'primary_phone' => fake()->phoneNumber(),
            'alternate_phone' => fake()->phoneNumber(),

            'primary_email' => fake()->safeEmail(),
            'alternate_email' => fake()->safeEmail(),

            'identification_type' => $type === 'INDIVIDUAL'
                ? fake()->randomElement([
                    'NATIONAL_IDENTIFICATION_NUMBER',
                    'BIRTH_REGISTRATION_NUMBER',
                    'PASSPORT',
                    'DRIVING_LICENSE',
                ])
                : 'REGISTRATION_NO',

            'identification_number' => strtoupper(Str::random(12)),

            'dob' => $type === 'INDIVIDUAL'
                ? fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d')
                : null,

            'gender' => $gender,

            'marital_status' => $type === 'INDIVIDUAL'
                ? fake()->randomElement([
                    'SINGLE',
                    'MARRIED',
                    'WIDOWED',
                    'DIVORCED',
                    'OTHER',
                ])
                : null,

            'blood_group' => $type === 'INDIVIDUAL'
                ? fake()->randomElement([
                    'A+',
                    'A-',
                    'B+',
                    'B-',
                    'AB+',
                    'AB-',
                    'O+',
                    'O-',
                ])
                : null,

            'nationality' => $type === 'INDIVIDUAL'
                ? fake()->country()
                : null,

            'occupation' => $type === 'INDIVIDUAL'
                ? fake()->jobTitle()
                : null,

            'education' => $type === 'INDIVIDUAL'
                ? fake()->randomElement([
                    'Primary',
                    'Secondary',
                    'Higher Secondary',
                    'Diploma',
                    'Bachelor',
                    'Master',
                    'PhD',
                ])
                : null,

            'religion' => $type === 'INDIVIDUAL'
                ? fake()->randomElement([
                    'CHRISTIANITY',
                    'ISLAM',
                    'HINDUISM',
                    'BUDDHISM',
                    'OTHER',
                ])
                : null,

            'status' => fake()->randomElement([
                'PENDING',
                'ACTIVE',
                'INACTIVE',
                'SUSPENDED',
            ]),
        ];
    }

    public function individualMale(): static
    {
        return $this->state(fn() => [
            'type' => 'INDIVIDUAL',
            'gender' => 'MALE',
            'name' => fake()->firstNameMale() . ' ' . fake()->lastName(),
            'customer_no' => 'IND-' . fake()->unique()->numerify('######'),
            'primary_phone' => fake()->phoneNumber(),
            'alternate_phone' => fake()->phoneNumber(),
            'primary_email' => fake()->safeEmail(),
            'alternate_email' => fake()->safeEmail(),
            'religion' => fake()->randomElement([
                'CHRISTIANITY',
                'ISLAM',
                'HINDUISM',
                'BUDDHISM',
                'OTHER',
            ]),
            'marital_status' => fake()->randomElement([
                'SINGLE',
                'MARRIED',
                'WIDOWED',
                'DIVORCED',
                'OTHER',
            ]),
            'blood_group' => fake()->randomElement([
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-',
            ]),
            'dob' => fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d'),
            'occupation' => fake()->jobTitle(),
            'education' => fake()->randomElement([
                'Primary',
                'Secondary',
                'Higher Secondary',
                'Diploma',
                'Bachelor',
                'Master',
                'PhD',
            ]),
            'nationality' => fake()->country(),
            'identification_type' => fake()->randomElement([
                'NATIONAL_IDENTIFICATION_NUMBER',
                'birth_registration_number',
                'passport',
                'driving_license',
            ]),
        ]);
    }

    public function individualFemale(): static
    {
        return $this->state(fn() => [
            'type' => 'INDIVIDUAL',
            'gender' => 'FEMALE',
            'name' => fake()->firstNameFemale() . ' ' . fake()->lastName(),
            'customer_no' => 'IND-' . fake()->unique()->numerify('######'),
            'primary_phone' => fake()->phoneNumber(),
            'alternate_phone' => fake()->phoneNumber(),
            'primary_email' => fake()->safeEmail(),
            'alternate_email' => fake()->safeEmail(),
            'religion' => fake()->randomElement([
                'CHRISTIANITY',
                'ISLAM',
                'HINDUISM',
                'BUDDHISM',
                'OTHER',
            ]),
            'marital_status' => fake()->randomElement([
                'SINGLE',
                'MARRIED',
                'WIDOWED',
                'DIVORCED',
                'OTHER',
            ]),
            'blood_group' => fake()->randomElement([
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-',
            ]),
            'dob' => fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d'),
            'occupation' => fake()->jobTitle(),
            'education' => fake()->randomElement([
                'Primary',
                'Secondary',
                'Higher Secondary',
                'Diploma',
                'Bachelor',
                'Master',
                'PhD',
            ]),
            'nationality' => fake()->country(),
            'identification_type' => fake()->randomElement([
                'NATIONAL_IDENTIFICATION_NUMBER',
                'birth_registration_number',
                'passport',
                'driving_license',
            ]),
        ]);
    }

    public function organization(): static
    {
        return $this->state(fn() => [
            'type' => 'ORGANIZATION',
            'gender' => null,
            'dob' => null,
            'marital_status' => null,
            'blood_group' => null,
            'nationality' => null,
            'occupation' => null,
            'education' => null,
            'religion' => null,
            'name' => fake()->company(),
            'customer_no' => 'ORG-' . fake()->unique()->numerify('######'),
            'identification_type' => 'REGISTRATION_NO',
        ]);
    }

    public function active(): static
    {
        return $this->state(fn() => [
            'status' => 'ACTIVE',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'status' => 'PENDING',
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn() => [
            'status' => 'SUSPENDED',
        ]);
    }
}