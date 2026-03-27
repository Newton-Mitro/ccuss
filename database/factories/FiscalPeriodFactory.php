<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\FiscalPeriod;
use App\FinanceAndAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class FiscalPeriodFactory extends Factory
{
    protected $model = FiscalPeriod::class;

    public function definition(): array
    {
        $start = Carbon::instance(
            fake()->dateTimeBetween('-1 year', 'now')
        )->startOfMonth();

        $end = $start->copy()->endOfMonth();

        return [
            'organization_id' => Organization::factory(),
            'fiscal_year_id' => FiscalYear::factory(),

            'period_name' => strtoupper($start->format('M-Y')),

            'start_date' => $start,
            'end_date' => $end,

            'is_open' => fake()->boolean(80),
        ];
    }
}