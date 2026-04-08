<?php

namespace App\Console\Commands;

use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DeleteAllBackups extends Command
{
    protected $signature = 'backup:delete-all';
    protected $description = 'Delete all database backup files and logs';

    public function handle()
    {
        $disk = Storage::disk('backup');

        $allFiles = $disk->allFiles();

        if (empty($allFiles)) {
            $this->info('Backup disk is empty. Nothing to delete.');
            return 0;
        }

        $deletedFiles = 0;
        $deletedLogs = 0;

        foreach ($allFiles as $file) {
            $disk->delete($file);
            $deletedFiles++;

            // Delete corresponding database log
            $deletedLogs += DatabaseBackupLog::where('file_path', $file)->delete();

            $this->info("Deleted backup: {$file}");
        }

        // Remove empty directories recursively
        $this->cleanupEmptyDirectories($disk, '');

        $this->info("All backups deleted.");
        $this->info("Files deleted: {$deletedFiles}");
        $this->info("Logs deleted: {$deletedLogs}");

        return 0;
    }

    /**
     * Remove empty folders recursively on a disk
     */
    protected function cleanupEmptyDirectories($disk, string $path): void
    {
        $directories = $disk->directories($path);

        foreach ($directories as $directory) {
            // Recurse first
            $this->cleanupEmptyDirectories($disk, $directory);

            // Delete if empty
            if (count($disk->files($directory)) === 0 && count($disk->directories($directory)) === 0) {
                $disk->deleteDirectory($directory);
                $this->info("Removed empty directory: {$directory}");
            }
        }
    }
}