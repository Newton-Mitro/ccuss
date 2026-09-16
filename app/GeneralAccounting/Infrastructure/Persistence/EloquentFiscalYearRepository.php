<?php

namespace App\GeneralAccounting\Infrastructure\Persistence;

use App\GeneralAccounting\Application\Contracts\FiscalYearRepositoryInterface;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Database\Eloquent\Builder;

class EloquentFiscalYearRepository implements FiscalYearRepositoryInterface
{
    public function query(): Builder
    {
        return FiscalYear::query();
    }

    public function overlaps(int $organizationId, string $startDate, string $endDate, ?int $excludeId = null): bool
    {
        return FiscalYear::query()
            ->where('organization_id', $organizationId)
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

    public function create(array $data): FiscalYear
    {
        return FiscalYear::create($data);
    }

    public function update(FiscalYear $fiscalYear, array $data): FiscalYear
    {
        $fiscalYear->update($data);

        return $fiscalYear->fresh();
    }

    public function delete(FiscalYear $fiscalYear): bool
    {
        return (bool) $fiscalYear->delete();
    }
}
