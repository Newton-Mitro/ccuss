<?php

namespace Database\Factories;

use App\Accounting\Models\FiscalPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiscalPeriodFactory extends Factory
{
    protected $model = FiscalPeriod::class;

    public function definition()
    {
        $start = $this->faker->dateTimeBetween('-1 year', 'now');
        $end = (clone $start)->modify('+1 month');

        return [
            'fiscal_year_id' => null, // assign later or via relationship
            'period_name' => strtoupper($start->format('M-Y')),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'is_open' => $this->faker->boolean(80),
        ];
    }
}
