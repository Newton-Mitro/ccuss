<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerFamilyRelation;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFamilyRelationFactory extends Factory
{
    protected $model = CustomerFamilyRelation::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),
            'dob' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['MALE', 'FEMALE']),
            'religion' => $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER']),
            'identification_type' => $this->faker->randomElement(['NID', 'PASSPORT']),
            'identification_number' => $this->faker->numerify('############'),
            'relation_type' => $this->faker->randomElement([
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
            ]),
            'verification_status' => 'PENDING',
        ];
    }
}
