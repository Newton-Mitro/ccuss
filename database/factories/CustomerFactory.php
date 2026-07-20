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
        $type = fake()->randomElement(['individual', 'organization']);

        $gender = $type === 'individual'
            ? fake()->randomElement(['male', 'female', 'other'])
            : null;

        $name = $type === 'organization'
            ? fake()->company()
            : match ($gender) {
                'male' => fake()->firstNameMale() . ' ' . fake()->lastName(),
                'female' => fake()->firstNameFemale() . ' ' . fake()->lastName(),
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
                $type === 'individual' ? 'IND' : 'ORG',
                fake()->unique()->numberBetween(1, 999999)
            ),

            'type' => $type,

            'name' => $name,

            'primary_phone' => fake()->phoneNumber(),
            'alternate_phone' => fake()->phoneNumber(),

            'primary_email' => fake()->safeEmail(),
            'alternate_email' => fake()->safeEmail(),

            'identification_type' => $type === 'individual'
                ? fake()->randomElement([
                    'national_identification_number',
                    'birth_registration_number',
                    'passport',
                    'driving_license',
                ])
                : 'registration_no',

            'identification_number' => strtoupper(Str::random(12)),

            'dob' => $type === 'individual'
                ? fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d')
                : null,

            'gender' => $gender,

            'marital_status' => $type === 'individual'
                ? fake()->randomElement([
                    'single',
                    'married',
                    'widowed',
                    'divorced',
                    'other',
                ])
                : null,

            'blood_group' => $type === 'individual'
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

            'nationality' => $type === 'individual'
                ? fake()->country()
                : null,

            'occupation' => $type === 'individual'
                ? fake()->jobTitle()
                : null,

            'education' => $type === 'individual'
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

            'religion' => $type === 'individual'
                ? fake()->randomElement([
                    'christianity',
                    'islam',
                    'hinduism',
                    'buddhism',
                    'other',
                ])
                : null,

            'status' => fake()->randomElement([
                'pending',
                'active',
                'inactive',
                'suspended',
            ]),
        ];
    }

    public function individualMale(): static
    {
        return $this->state(fn() => [
            'type' => 'individual',
            'gender' => 'male',
            'name' => fake()->firstNameMale() . ' ' . fake()->lastName(),
            'customer_no' => 'IND-' . fake()->unique()->numerify('######'),
            'primary_phone' => fake()->phoneNumber(),
            'alternate_phone' => fake()->phoneNumber(),
            'primary_email' => fake()->safeEmail(),
            'alternate_email' => fake()->safeEmail(),
            'religion' => fake()->randomElement([
                'christianity',
                'islam',
                'hinduism',
                'buddhism',
                'other',
            ]),
            'marital_status' => fake()->randomElement([
                'single',
                'married',
                'widowed',
                'divorced',
                'other',
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
                'national_identification_number',
                'birth_registration_number',
                'passport',
                'driving_license',
            ]),
        ]);
    }

    public function individualFemale(): static
    {
        return $this->state(fn() => [
            'type' => 'individual',
            'gender' => 'female',
            'name' => fake()->firstNameFemale() . ' ' . fake()->lastName(),
            'customer_no' => 'IND-' . fake()->unique()->numerify('######'),
            'primary_phone' => fake()->phoneNumber(),
            'alternate_phone' => fake()->phoneNumber(),
            'primary_email' => fake()->safeEmail(),
            'alternate_email' => fake()->safeEmail(),
            'religion' => fake()->randomElement([
                'christianity',
                'islam',
                'hinduism',
                'buddhism',
                'other',
            ]),
            'marital_status' => fake()->randomElement([
                'single',
                'married',
                'widowed',
                'divorced',
                'other',
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
                'national_identification_number',
                'birth_registration_number',
                'passport',
                'driving_license',
            ]),
        ]);
    }

    public function organization(): static
    {
        return $this->state(fn() => [
            'type' => 'organization',
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
            'identification_type' => 'registration_no',
        ]);
    }

    public function active(): static
    {
        return $this->state(fn() => [
            'status' => 'active',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'status' => 'pending',
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn() => [
            'status' => 'suspended',
        ]);
    }
}