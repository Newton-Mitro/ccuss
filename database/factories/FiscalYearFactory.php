<?php

namespace Database\Factories;

use App\Accounting\Models\FiscalYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiscalYearFactory extends Factory
{
    protected $model = FiscalYear::class;

    public function definition()
    {
        $start = $this->faker->dateTimeBetween('-3 years', 'now');
        $end = (clone $start)->modify('+1 year');

        return [
            'code' => 'FY-' . $start->format('Y') . '-' . $end->format('y'),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'is_active' => $this->faker->boolean(50),
            'is_closed' => $this->faker->boolean(20),
        ];
    }
}
