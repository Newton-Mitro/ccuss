<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\InstrumentType;
use Illuminate\Database\Eloquent\Factories\Factory;

class InstrumentTypeFactory extends Factory
{
    protected $model = InstrumentType::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('INST-###')),
            'name' => $this->faker->unique()->word() . ' Instrument',
        ];
    }
}