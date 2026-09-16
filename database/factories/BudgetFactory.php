<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'fiscal_year_id' => FiscalYear::factory(),
            'name' => fake()->unique()->words(2, true) . ' Budget',
            'status' => 'DRAFT',
        ];
    }
}
