<?php

namespace Database\Factories;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiscalPeriodFactory extends Factory
{
    protected $model = FiscalPeriod::class;

    public function definition()
    {
        $start = $this->faker->dateTimeBetween('-1 year', 'now');
        $end = (clone $start)->modify('+1 month');

        return [
            'fiscal_year_id' => FiscalYear::factory(),
            'period_name' => strtoupper($this->faker->monthName) . '-' . now()->year,
            'start_date' => now()->startOfMonth(),
            'end_date' => now()->endOfMonth(),
            'is_open' => true,
        ];
    }
}
