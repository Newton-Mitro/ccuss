<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\InstrumentType;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class InstrumentTypeFactory extends Factory
{
    protected $model = InstrumentType::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),

            'code' => strtoupper(fake()->unique()->bothify('INST-###')),

            'name' => fake()->randomElement([
                'Cash',
                'Cheque',
                'Bank Transfer',
                'Mobile Payment',
                'Card Payment',
                'Online Transfer'
            ]),
        ];
    }
}