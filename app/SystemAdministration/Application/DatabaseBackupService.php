<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\DatabaseBackupRepositoryInterface;
use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Support\Facades\Storage;

class DatabaseBackupService
{
    public function __construct(
        private readonly DatabaseBackupRepositoryInterface $databaseBackupRepository,
    ) {
    }

    public function deleteBackup(DatabaseBackupLog $log): bool
    {
        $disk = Storage::disk($log->storage_disk ?: 'backup');

        if ($log->file_path) {
            $relativePath = ltrim($log->file_path, '/');

            if ($disk->exists($relativePath)) {
                $disk->delete($relativePath);
            }
        }

        return $this->databaseBackupRepository->delete($log);
    }
}
