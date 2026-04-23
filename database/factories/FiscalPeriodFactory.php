<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class FiscalPeriodFactory extends Factory
{
    protected $model = FiscalPeriod::class;

    public function definition(): array
    {
        // Pick a random start date within the fiscal year
        $start = Carbon::instance(
            fake()->dateTimeBetween('-1 year', 'now')
        )->startOfMonth();

        $end = $start->copy()->endOfMonth();

        return [
            'fiscal_year_id' => FiscalYear::factory(),

            'period_name' => strtoupper($start->format('M-Y')),

            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),

            'status' => 'open', // default; can override with states
        ];
    }

    /**
     * Mark fiscal period as closed
     */
    public function closed(): static
    {
        return $this->state(fn() => [
            'status' => 'closed',
        ]);
    }

    /**
     * Mark fiscal period as locked
     */
    public function locked(): static
    {
        return $this->state(fn() => [
            'status' => 'locked',
        ]);
    }
}