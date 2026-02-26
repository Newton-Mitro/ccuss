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
        $start = Carbon::now()->startOfYear();
        $end = (clone $start)->addYear()->subDay();

        $fy = FiscalYear::factory()
            ->active()
            ->create([
                'code' => 'FY-' . $start->format('Y') . '-' . $end->format('y'),
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ]);

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
        $this->command->info('✅ Fiscal Year created');
    }
}
