<?php

namespace App\GeneralAccounting\Infrastructure\Persistence;

use App\GeneralAccounting\Application\Contracts\FiscalPeriodRepositoryInterface;
use App\GeneralAccounting\Models\FiscalPeriod;
use Illuminate\Database\Eloquent\Builder;

class EloquentFiscalPeriodRepository implements FiscalPeriodRepositoryInterface
{
    public function query(): Builder
    {
        return FiscalPeriod::query();
    }

    public function overlaps(int $fiscalYearId, string $startDate, string $endDate, ?int $excludeId = null): bool
    {
        return FiscalPeriod::query()
            ->where('fiscal_year_id', $fiscalYearId)
            ->where(function (Builder $query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function (Builder $nested) use ($startDate, $endDate) {
                        $nested->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->when($excludeId, fn(Builder $query) => $query->where('id', '!=', $excludeId))
            ->exists();
    }

    public function create(array $data): FiscalPeriod
    {
        return FiscalPeriod::create($data);
    }

    public function update(FiscalPeriod $fiscalPeriod, array $data): FiscalPeriod
    {
        $fiscalPeriod->update($data);

        return $fiscalPeriod->fresh();
    }

    public function delete(FiscalPeriod $fiscalPeriod): bool
    {
        return (bool) $fiscalPeriod->delete();
    }
}
