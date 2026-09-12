<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\AuditLogRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class AuditLogService
{
    public function __construct(
        private readonly AuditLogRepositoryInterface $auditLogRepository,
    ) {
    }

    public function latestBatches(int $perPage = 18): Collection
    {
        return $this->auditLogRepository->latestBatches($perPage);
    }
}
