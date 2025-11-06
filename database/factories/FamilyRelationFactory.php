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

        // pick random distinct customers
        $customer = Customer::inRandomOrder()->first() ?? Customer::factory()->create();
        $relative = Customer::where('id', '!=', $customer->id)
            ->inRandomOrder()
            ->first() ?? Customer::factory()->create();

        $relation = $this->faker->randomElement($relations);

        // ✅ Avoid duplicate pairs (unique constraint protection)
        // Retry until a unique pair is found (max 5 attempts to stay safe)
        $attempts = 0;
        while (
            FamilyRelation::where('customer_id', $customer->id)
                ->where('relative_id', $relative->id)
                ->exists() &&
            $attempts < 5
        ) {
            $relative = Customer::where('id', '!=', $customer->id)
                ->inRandomOrder()
                ->first();
            $attempts++;
        }

        // If still exists after retries, skip — ensures seeder won't break
        if (
            FamilyRelation::where('customer_id', $customer->id)
                ->where('relative_id', $relative->id)
                ->exists()
        ) {
            return []; // Laravel will skip this record if it's empty
        }

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
            default => $this->faker->randomElement([
                'COUSIN_BROTHER',
                'COUSIN_SISTER',
                'FATHER-IN-LAW',
                'MOTHER-IN-LAW',
                'SON-IN-LAW',
                'DAUGHTER-IN-LAW',
                'BROTHER-IN-LAW',
                'SISTER-IN-LAW',
            ]),
        };
    }
}
