<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\Denomination;
use Illuminate\Database\Eloquent\Factories\Factory;

class DenominationFactory extends Factory
{
    protected $model = Denomination::class;

    public function definition(): array
    {
        return [
            'value' => $this->faker->randomElement([1, 2, 5, 10, 20, 50, 100, 500, 1000]),
            'is_active' => true,
        ];
    }
}