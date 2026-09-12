<?php

namespace App\SystemAdministration\Application\Contracts;

use App\SystemAdministration\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

interface AuditLogRepositoryInterface
{
    public function query(): Builder;

    public function latestBatches(int $perPage = 18): Collection;

    public function create(array $data): AuditLog;
}
