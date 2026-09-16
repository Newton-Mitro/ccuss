<?php

namespace App\GeneralAccounting\Application\Contracts;

use App\GeneralAccounting\Models\FiscalPeriod;
use Illuminate\Database\Eloquent\Builder;

interface FiscalPeriodRepositoryInterface
{
    public function query(): Builder;

    public function overlaps(int $fiscalYearId, string $startDate, string $endDate, ?int $excludeId = null): bool;

    public function create(array $data): FiscalPeriod;

    public function update(FiscalPeriod $fiscalPeriod, array $data): FiscalPeriod;

    public function delete(FiscalPeriod $fiscalPeriod): bool;
}
