<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\FiscalYear;
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
        $start = Carbon::instance(
            $this->faker->dateTimeBetween('-3 years', 'now')
        )->startOfYear();

        $end = $start->copy()->addYear()->subDay();

        return [
            'organization_id' => Organization::factory(),

            'code' => 'FY-' . $start->format('Y') . '-' . $end->format('y'),

            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),

            'is_active' => false,
            'is_closed' => false,
        ];
    }

    public function active(): static
    {
        return $this->state(fn() => [
            'is_active' => true,
            'is_closed' => false,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn() => [
            'is_active' => false,
            'is_closed' => true,
        ]);
    }
}