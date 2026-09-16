<?php

namespace App\GeneralAccounting\Application\Contracts;

use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Database\Eloquent\Builder;

interface FiscalYearRepositoryInterface
{
    public function query(): Builder;

    public function overlaps(int $organizationId, string $startDate, string $endDate, ?int $excludeId = null): bool;

    public function create(array $data): FiscalYear;

    public function update(FiscalYear $fiscalYear, array $data): FiscalYear;

    public function delete(FiscalYear $fiscalYear): bool;
}
