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
        return $this->organizationQuery();
    }

    public function latestBatches(int $perPage = 18): Collection
    {
        $organizationId = request()->attributes->get('active_organization')?->id;

        return $this->organizationQuery()
            ->with('user')
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')
                    ->from('audit_logs')
                    ->when(
                        request()->attributes->get('active_organization'),
                        fn($query) => $query->where(
                            'organization_id',
                            request()->attributes->get('active_organization')->id,
                        ),
                    )
                    ->groupBy('batch_id');
            })
            ->orderBy('created_at', 'desc')
            ->limit($perPage)
            ->get();
    }

    private function organizationQuery(): Builder
    {
        $query = AuditLog::query();
        $organization = request()->attributes->get('active_organization');

        return $organization
            ? $query->where('organization_id', $organization->id)
            : $query;
    }

    public function create(array $data): AuditLog
    {
        return AuditLog::create($data);
    }
}
