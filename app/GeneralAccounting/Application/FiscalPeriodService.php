<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\FiscalPeriodRepositoryInterface;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class FiscalPeriodService
{
    public function __construct(
        private readonly FiscalPeriodRepositoryInterface $fiscalPeriodRepository,
    ) {
    }

    public function create(FiscalYear $fiscalYear, array $data): FiscalPeriod
    {
        $data['fiscal_year_id'] = $fiscalYear->id;
        $this->validateWithinYear($fiscalYear, $data);

        if ($this->fiscalPeriodRepository->overlaps($fiscalYear->id, $data['start_date'], $data['end_date'])) {
            throw new RuntimeException('The fiscal period overlaps an existing fiscal period.');
        }

        return $this->fiscalPeriodRepository->create($data);
    }

    public function update(FiscalPeriod $fiscalPeriod, array $data): FiscalPeriod
    {
        $fiscalYear = $fiscalPeriod->fiscalYear;
        $this->validateWithinYear($fiscalYear, $data);

        if (
            $this->fiscalPeriodRepository->overlaps(
                $fiscalYear->id,
                $data['start_date'],
                $data['end_date'],
                $fiscalPeriod->id,
            )
        ) {
            throw new RuntimeException('The fiscal period overlaps an existing fiscal period.');
        }

        return $this->fiscalPeriodRepository->update($fiscalPeriod, $data);
    }

    public function delete(FiscalPeriod $fiscalPeriod): bool
    {
        if ($fiscalPeriod->status === 'CLOSED') {
            throw new RuntimeException('A closed fiscal period cannot be deleted.');
        }

        return DB::transaction(fn() => $this->fiscalPeriodRepository->delete($fiscalPeriod));
    }

    public function close(FiscalPeriod $fiscalPeriod): FiscalPeriod
    {
        if ($fiscalPeriod->status === 'CLOSED') {
            throw new RuntimeException('The fiscal period is already closed.');
        }

        if ($fiscalPeriod->vouchers()->where('status', 'DRAFT')->exists()) {
            throw new RuntimeException('The fiscal period has draft vouchers that must be resolved first.');
        }

        return $this->fiscalPeriodRepository->update($fiscalPeriod, ['status' => 'CLOSED']);
    }

    public function reopen(FiscalPeriod $fiscalPeriod): FiscalPeriod
    {
        if ($fiscalPeriod->status !== 'CLOSED') {
            throw new RuntimeException('Only closed fiscal periods can be reopened.');
        }

        return $this->fiscalPeriodRepository->update($fiscalPeriod, ['status' => 'OPEN']);
    }

    private function validateWithinYear(FiscalYear $fiscalYear, array $data): void
    {
        if (($data['start_date'] ?? '') >= ($data['end_date'] ?? '')) {
            throw new InvalidArgumentException('The fiscal period end date must be after the start date.');
        }

        if (
            $data['start_date'] < $fiscalYear->start_date->toDateString()
            || $data['end_date'] > $fiscalYear->end_date->toDateString()
        ) {
            throw new InvalidArgumentException('The fiscal period must be within its fiscal year.');
        }
    }
}
