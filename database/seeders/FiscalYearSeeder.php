<?php

namespace Database\Seeders;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class FiscalYearSeeder extends Seeder
{
    public function run(): void
    {
        $fy = FiscalYear::factory()->active()->create();

        for ($i = 0; $i < 12; $i++) {
            $start = Carbon::parse($fy->start_date)->addMonths($i);
            FiscalPeriod::create([
                'fiscal_year_id' => $fy->id,
                'period_name' => strtoupper($start->format('M-Y')),
                'start_date' => $start->startOfMonth(),
                'end_date' => $start->endOfMonth(),
                'is_open' => true,
            ]);
        }
    }
}
