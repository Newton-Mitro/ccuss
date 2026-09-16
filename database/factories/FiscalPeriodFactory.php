<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiscalPeriodFactory extends Factory
{
    protected $model = FiscalPeriod::class;

    public function definition(): array
    {
        return [
            'fiscal_year_id' => FiscalYear::factory(),
            'name' => 'July 2025',
            'start_date' => '2025-07-01',
            'end_date' => '2025-07-31',
            'status' => 'OPEN',
        ];
    }
}
