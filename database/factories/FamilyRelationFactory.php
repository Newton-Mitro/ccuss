<?php

namespace Database\Factories;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\FamilyRelation\Models\FamilyRelation;
use Illuminate\Database\Eloquent\Factories\Factory;

class FamilyRelationFactory extends Factory
{
    protected $model = FamilyRelation::class;

    public function definition(): array
    {
        $relations = [
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
        ];

        $customer = Customer::inRandomOrder()->first() ?? Customer::factory()->create();
        $relative = Customer::where('id', '!=', $customer->id)->inRandomOrder()->first() ?? Customer::factory()->create();

        $relation = $this->faker->randomElement($relations);

        return [
            'customer_id' => $customer->id,
            'relative_id' => $relative->id,
            'relation_type' => $relation,
            'reverse_relation_type' => $this->getReverseRelation($relation),
        ];
    }

    private function getReverseRelation(string $relation): string
    {
        return match ($relation) {
            'FATHER' => 'SON',
            'MOTHER' => 'SON',
            'SON' => 'FATHER',
            'DAUGHTER' => 'FATHER',
            'HUSBAND' => 'WIFE',
            'WIFE' => 'HUSBAND',
            'BROTHER' => 'SISTER',
            'SISTER' => 'BROTHER',
            'GRANDFATHER' => 'GRANDSON',
            'GRANDMOTHER' => 'GRANDSON',
            'UNCLE' => 'NEPHEW',
            'AUNT' => 'NIECE',
            'NEPHEW' => 'UNCLE',
            'NIECE' => 'AUNT',
            // 👇 Instead of 'OTHER', pick a random valid relation
            default => $this->faker->randomElement([
                'COUSIN_BROTHER',
                'COUSIN_SISTER',
                'FATHER-IN-LAW',
                'MOTHER-IN-LAW',
                'SON-IN-LAW',
                'DAUGHTER-IN-LAW',
                'BROTHER-IN-LAW',
                'SISTER-IN-LAW'
            ]),
        };
    }

}
