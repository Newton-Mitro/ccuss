<?php

namespace App\SystemAdministration\Infrastructure\Persistence;

use App\SystemAdministration\Application\Contracts\DatabaseBackupRepositoryInterface;
use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Database\Eloquent\Builder;

class EloquentDatabaseBackupRepository implements DatabaseBackupRepositoryInterface
{
    public function query(): Builder
    {
        return DatabaseBackupLog::query();
    }

    public function findById(int $id): ?DatabaseBackupLog
    {
        return DatabaseBackupLog::find($id);
    }

    public function delete(DatabaseBackupLog $log): bool
    {
        return (bool) $log->delete();
    }
}
