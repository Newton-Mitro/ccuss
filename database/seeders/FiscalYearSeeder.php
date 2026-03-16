<?php

namespace Database\Seeders;

use App\FinanceAndAccounting\Models\AccountingPeriod;
use App\FinanceAndAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class FiscalYearSeeder extends Seeder
{
    public function run(): void
    {
        // Get an organization, or create a default one
        $organization = Organization::first() ?? Organization::factory()->create();

        // Fiscal year starts in July
        $start = Carbon::create(now()->year, 7, 1);

        // If today is before July, roll back one year
        if (now()->month < 7) {
            $start->subYear();
        }

        $end = (clone $start)->addYear()->subDay();

        // Create the active fiscal year
        $fy = FiscalYear::factory()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'code' => 'FY-' . $start->format('Y') . '-' . $end->format('y'),
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ]);

        // Generate 12 accounting periods (July → June)
        for ($i = 0; $i < 12; $i++) {
            $periodStart = (clone $start)->addMonths($i);

            AccountingPeriod::create([
                'organization_id' => $organization->id,
                'fiscal_year_id' => $fy->id,
                'period_name' => strtoupper($periodStart->format('M-Y')),
                'start_date' => $periodStart->copy()->startOfMonth(),
                'end_date' => $periodStart->copy()->endOfMonth(),
                'is_open' => true,
            ]);
        }

        $this->command->info("✅ Fiscal Year & Periods (JUL–JUN) created for organization ID {$organization->id}");
    }
}