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
            'pending',
            'verified',
            'rejected',
        ]);

        return [
            'customer_id' => Customer::factory(),
            'relative_id' => Customer::factory(),

            'relation_type' => fake()->randomElement([
                'father',
                'mother',
                'son',
                'daughter',
                'brother',
                'sister',
                'husband',
                'wife',
                'grandfather',
                'grandmother',
                'uncle',
                'aunt',
                'nephew',
                'niece',
                'father_in_law',
                'mother_in_law',
                'son_in_law',
                'daughter_in_law',
                'brother_in_law',
                'sister_in_law',
            ]),

            'verification_status' => $status,

            'verified_at' => $status === 'verified'
                ? fake()->dateTimeBetween('-1 year', 'now')
                : null,

            'remarks' => $status === 'rejected'
                ? fake()->sentence()
                : null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'verified',
            'verified_at' => now(),
            'remarks' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'pending',
            'verified_at' => null,
            'remarks' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'rejected',
            'verified_at' => null,
            'remarks' => fake()->sentence(),
        ]);
    }

    public function father(): static
    {
        return $this->state(fn() => [
            'relation_type' => 'father',
        ]);
    }

    public function mother(): static
    {
        return $this->state(fn() => [
            'relation_type' => 'mother',
        ]);
    }

    public function spouse(): static
    {
        return $this->state(fn() => [
            'relation_type' => fake()->randomElement([
                'husband',
                'wife',
            ]),
        ]);
    }

    public function child(): static
    {
        return $this->state(fn() => [
            'relation_type' => fake()->randomElement([
                'son',
                'daughter',
            ]),
        ]);
    }

    public function sibling(): static
    {
        return $this->state(fn() => [
            'relation_type' => fake()->randomElement([
                'brother',
                'sister',
            ]),
        ]);
    }
}