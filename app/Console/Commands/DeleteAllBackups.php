<?php

namespace App\Console\Commands;

use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class DeleteAllBackups extends Command
{
    protected $signature = 'backup:delete-all';
    protected $description = 'Delete all database backup files and logs';

    public function handle()
    {
        $basePath = storage_path('app/backups');

        if (!File::exists($basePath)) {
            $this->info('Backup directory does not exist. Nothing to delete.');
            return 0;
        }

        $deletedFiles = 0;
        $deletedLogs = 0;

        // Get all files recursively
        $files = File::allFiles($basePath);

        foreach ($files as $file) {
            $relativePath = str_replace(
                storage_path('app') . DIRECTORY_SEPARATOR,
                '',
                $file->getRealPath()
            );

            // Delete the file
            File::delete($file->getRealPath());
            $deletedFiles++;

            // Delete corresponding database log
            $deletedLogs += DatabaseBackupLog::where('file_path', $relativePath)->delete();

            $this->info("Deleted backup: {$relativePath}");
        }

        // Remove empty directories
        $this->cleanupEmptyDirectories($basePath);

        $this->info("All backups deleted.");
        $this->info("Files deleted: {$deletedFiles}");
        $this->info("Logs deleted: {$deletedLogs}");

        return 0;
    }

    /**
     * Remove empty directories recursively
     */
    protected function cleanupEmptyDirectories(string $path): void
    {
        $directories = File::directories($path);

        foreach ($directories as $directory) {
            $this->cleanupEmptyDirectories($directory);

            if (count(File::files($directory)) === 0 && count(File::directories($directory)) === 0) {
                File::deleteDirectory($directory);
                $this->info("Removed empty directory: {$directory}");
            }
        }
    }
}