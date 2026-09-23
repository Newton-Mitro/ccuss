<?php

namespace App\Console\Commands;

use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Models\LoanAccount;
use Illuminate\Console\Command;

class AssessLoanArrears extends Command
{
    protected $signature = 'loans:assess-arrears {--date= : Assessment date in YYYY-MM-DD format}';

    protected $description = 'Assess overdue loan schedule components for all active loans';

    public function handle(LoanScheduleService $scheduleService): int
    {
        $date = $this->option('date') ?: now()->toDateString();
        $assessed = 0;

        LoanAccount::query()
            ->whereIn('status', ['ACTIVE', 'PARTIALLY_DISBURSED'])
            ->each(function (LoanAccount $loan) use ($scheduleService, $date, &$assessed): void {
                $assessed += count($scheduleService->assessArrears($loan, $date));
            });

        $this->info("Assessed {$assessed} overdue schedule(s) for {$date}.");

        return self::SUCCESS;
    }
}