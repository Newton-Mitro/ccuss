<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Application\Contracts\FiscalYearRepositoryInterface;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class FiscalYearService
{
    public function __construct(
        private readonly FiscalYearRepositoryInterface $fiscalYearRepository,
    ) {
    }

    public function create(array $data): FiscalYear
    {
        $this->validateDateRange($data);

        $organizationId = (int) $data['organization_id'];
        if ($this->fiscalYearRepository->overlaps($organizationId, $data['start_date'], $data['end_date'])) {
            throw new RuntimeException('The fiscal year overlaps an existing fiscal year.');
        }

        return DB::transaction(function () use ($data, $organizationId) {
            if (($data['is_current'] ?? false) === true) {
                FiscalYear::query()
                    ->where('organization_id', $organizationId)
                    ->update(['is_current' => false]);
            }

            return $this->fiscalYearRepository->create($data);
        });
    }

    public function update(FiscalYear $fiscalYear, array $data): FiscalYear
    {
        $this->validateDateRange($data);

        if (
            $this->fiscalYearRepository->overlaps(
                $fiscalYear->organization_id,
                $data['start_date'],
                $data['end_date'],
                $fiscalYear->id,
            )
        ) {
            throw new RuntimeException('The fiscal year overlaps an existing fiscal year.');
        }

        return DB::transaction(function () use ($fiscalYear, $data) {
            if (($data['is_current'] ?? false) === true) {
                FiscalYear::query()
                    ->where('organization_id', $fiscalYear->organization_id)
                    ->where('id', '!=', $fiscalYear->id)
                    ->update(['is_current' => false]);
            }

            return $this->fiscalYearRepository->update($fiscalYear, $data);
        });
    }

    public function delete(FiscalYear $fiscalYear): bool
    {
        if ($fiscalYear->periods()->exists()) {
            throw new RuntimeException('A fiscal year with periods cannot be deleted.');
        }

        return $this->fiscalYearRepository->delete($fiscalYear);
    }

    public function closeYear(FiscalYear $fiscalYear): FiscalYear
    {
        if ($fiscalYear->periods()->where('status', '!=', 'CLOSED')->exists()) {
            throw new RuntimeException('all periods must be closed');
        }

        return DB::transaction(function () use ($fiscalYear) {
            $fiscalYear->update(['status' => 'CLOSED']);

            return $fiscalYear->fresh();
        });
    }

    private function validateDateRange(array $data): void
    {
        if (($data['start_date'] ?? '') >= ($data['end_date'] ?? '')) {
            throw new InvalidArgumentException('The fiscal year end date must be after the start date.');
        }
    }
}
