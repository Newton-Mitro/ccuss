<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerFamilyRelation;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFamilyRelationFactory extends Factory
{
    protected $model = CustomerFamilyRelation::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            'PENDING',
            'VERIFIED',
            'REJECTED',
        ]);

        return [
            'customer_id' => Customer::factory(),
            'relative_id' => Customer::factory(),

            'relation_type' => fake()->randomElement([
                'FATHER',
                'MOTHER',
                'SON',
                'DAUGHTER',
                'BROTHER',
                'SISTER',
                'HUSBAND',
                'WIFE',
                'GRANDFATHER',
                'GRANDMOTHER',
                'UNCLE',
                'AUNT',
                'NEPHEW',
                'NIECE',
                'FATHER_IN_LAW',
                'MOTHER_IN_LAW',
                'SON_IN_LAW',
                'DAUGHTER_IN_LAW',
                'BROTHER_IN_LAW',
                'SISTER_IN_LAW',
            ]),

            'verification_status' => $status,

            'verified_at' => $status === 'VERIFIED'
                ? fake()->dateTimeBetween('-1 year', 'now')
                : null,

            'remarks' => $status === 'REJECTED'
                ? fake()->sentence()
                : null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'VERIFIED',
            'verified_at' => now(),
            'remarks' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'PENDING',
            'verified_at' => null,
            'remarks' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'REJECTED',
            'verified_at' => null,
            'remarks' => fake()->sentence(),
        ]);
    }

    public function father(): static
    {
        return $this->state(fn() => [
            'relation_type' => 'FATHER',
        ]);
    }

    public function mother(): static
    {
        return $this->state(fn() => [
            'relation_type' => 'MOTHER',
        ]);
    }

    public function spouse(): static
    {
        return $this->state(fn() => [
            'relation_type' => fake()->randomElement([
                'HUSBAND',
                'WIFE',
            ]),
        ]);
    }

    public function child(): static
    {
        return $this->state(fn() => [
            'relation_type' => fake()->randomElement([
                'SON',
                'DAUGHTER',
            ]),
        ]);
    }

    public function sibling(): static
    {
        return $this->state(fn() => [
            'relation_type' => fake()->randomElement([
                'BROTHER',
                'SISTER',
            ]),
        ]);
    }
}