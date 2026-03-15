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
            'SISTER_IN_LAW'
        ];

        return [
            'relation_type' => $this->faker->randomElement($relationTypes),

            // Verification
            'verification_status' => 'PENDING',
            'verified_by' => null,
            'verified_at' => null,
            'remarks' => $this->faker->optional()->sentence(),

            // Audit
            'created_by' => null,
            'updated_by' => null,
        ];
    }
}