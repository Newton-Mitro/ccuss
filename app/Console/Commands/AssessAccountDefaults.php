<?php

namespace App\Console\Commands;

use App\FinancialServices\Application\DefaultFineService;
use App\SystemAdministration\Models\Organization;
use Illuminate\Console\Command;

class AssessAccountDefaults extends Command
{
    protected $signature = 'accounts:assess-defaults {--date= : Assessment date in YYYY-MM-DD format}';

    protected $description = 'Assess overdue account obligations and create default fines';

    public function handle(DefaultFineService $defaultFineService): int
    {
        $date = $this->option('date') ?: now()->toDateString();
        $assessed = 0;
        Organization::query()->each(function (Organization $organization) use ($defaultFineService, $date, &$assessed): void {
            $assessed += count($defaultFineService->assessOrganization($organization->id, $date));
        });

        $this->info("Assessed {$assessed} default event(s) for {$date}.");

        return self::SUCCESS;
    }
}