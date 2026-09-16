<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiscalYearFactory extends Factory
{
    protected $model = FiscalYear::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => '2025-2026',
            'start_date' => '2025-07-01',
            'end_date' => '2026-06-30',
            'status' => 'OPEN',
            'is_current' => true,
        ];
    }
}
