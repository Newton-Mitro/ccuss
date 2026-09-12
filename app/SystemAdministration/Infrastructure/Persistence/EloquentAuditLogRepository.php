<?php

namespace App\SystemAdministration\Infrastructure\Persistence;

use App\SystemAdministration\Application\Contracts\AuditLogRepositoryInterface;
use App\SystemAdministration\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class EloquentAuditLogRepository implements AuditLogRepositoryInterface
{
    public function query(): Builder
    {
        return AuditLog::query();
    }

    public function latestBatches(int $perPage = 18): Collection
    {
        return AuditLog::query()
            ->with('user')
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')
                    ->from('audit_logs')
                    ->groupBy('batch_id');
            })
            ->orderBy('created_at', 'desc')
            ->limit($perPage)
            ->get();
    }

    public function create(array $data): AuditLog
    {
        return AuditLog::create($data);
    }
}
