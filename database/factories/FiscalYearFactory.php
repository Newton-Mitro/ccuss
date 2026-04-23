<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class FiscalYearFactory extends Factory
{
    protected $model = FiscalYear::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        // Pick a random start year in the past 3 years
        $start = Carbon::instance(
            fake()->dateTimeBetween('-3 years', 'now')
        )->startOfYear();

        $end = $start->copy()->endOfYear(); // full year

        return [
            'organization_id' => Organization::factory(),

            'code' => 'FY-' . $start->format('Y') . '-' . $end->format('y'),

            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),

            'is_closed' => false,
        ];
    }

    /**
     * Mark fiscal year as active
     */
    public function active(): static
    {
        return $this->state(fn() => [
            'is_closed' => false,
        ]);
    }

    /**
     * Mark fiscal year as closed
     */
    public function closed(): static
    {
        return $this->state(fn() => [
            'is_closed' => true,
        ]);
    }
}