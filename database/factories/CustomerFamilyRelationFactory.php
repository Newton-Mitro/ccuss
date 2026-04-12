<?php

namespace Database\Factories;

use App\CustomerModule\Models\CustomerFamilyRelation;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFamilyRelationFactory extends Factory
{
    protected $model = CustomerFamilyRelation::class;

    public function definition(): array
    {
        $relationTypes = [
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
            'sister_in_law'
        ];

        return [
            'relation_type' => fake()->randomElement($relationTypes),
            // Verification
            'verification_status' => 'pending',
            'verified_at' => null,
            'remarks' => fake()->optional()->sentence(),
        ];
    }
}