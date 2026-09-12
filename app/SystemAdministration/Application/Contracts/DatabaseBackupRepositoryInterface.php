<?php

namespace App\SystemAdministration\Application\Contracts;

use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Database\Eloquent\Builder;

interface DatabaseBackupRepositoryInterface
{
    public function query(): Builder;

    public function findById(int $id): ?DatabaseBackupLog;

    public function delete(DatabaseBackupLog $log): bool;
}
