<?php

namespace Database\Seeders;

use App\FinanceAndAccounting\Models\AccountingPeriod;
use App\FinanceAndAccounting\Models\FiscalYear;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class FiscalYearSeeder extends Seeder
{
    public function run(): void
    {
        // Fiscal year starts in July
        $start = Carbon::create(now()->year, 7, 1);

        // If today is before July, roll back one year
        if (now()->month < 7) {
            $start->subYear();
        }

        $end = (clone $start)->addYear()->subDay();

        $fy = FiscalYear::factory()
            ->active()
            ->create([
                'code' => 'FY-' . $start->format('Y') . '-' . $end->format('y'),
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ]);

        for ($i = 0; $i < 12; $i++) {
            $periodStart = (clone $start)->addMonths($i);

            AccountingPeriod::create([
                'fiscal_year_id' => $fy->id,
                'period_name' => strtoupper($periodStart->format('M-Y')),
                'start_date' => $periodStart->copy()->startOfMonth(),
                'end_date' => $periodStart->copy()->endOfMonth(),
                'is_open' => true,
            ]);
        }

        $this->command->info('✅ Fiscal Year & Periods (JUL–JUN) created');
    }
}