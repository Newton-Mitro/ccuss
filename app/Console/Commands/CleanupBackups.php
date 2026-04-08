<?php

namespace App\Console\Commands;

use App\SystemAdministration\Models\DatabaseBackupLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupBackups extends Command
{
    protected $signature = 'backup:cleanup {--days=30 : Number of days to keep backups}';
    protected $description = 'Cleanup old database backup files and logs';

    public function handle()
    {
        $days = (int) $this->option('days');
        $disk = Storage::disk('backup');

        if (!$disk->exists('')) {
            $this->info('Backup disk is empty. Nothing to clean.');
            return 0;
        }

        $deletedFiles = 0;
        $deletedLogs = 0;

        // 📂 Get all files recursively
        $allFiles = $disk->allFiles();

        foreach ($allFiles as $file) {
            $lastModified = Carbon::createFromTimestamp($disk->lastModified($file));

            if ($lastModified->lt(now()->subDays($days))) {
                // 🧹 Delete file
                $disk->delete($file);
                $deletedFiles++;

                // 🗑️ Delete corresponding DB log
                $deletedLogs += DatabaseBackupLog::where('file_path', $file)->delete();

                $this->info("Deleted backup: {$file}");
            }
        }

        // 🧼 Remove empty directories recursively
        $this->cleanupEmptyDirectories($disk, '');

        $this->info("Cleanup complete.");
        $this->info("Files deleted: {$deletedFiles}");
        $this->info("Logs deleted: {$deletedLogs}");

        return 0;
    }

    /**
     * 🧼 Remove empty directories recursively on the disk
     */
    protected function cleanupEmptyDirectories($disk, string $path): void
    {
        $directories = $disk->directories($path);

        foreach ($directories as $directory) {
            $this->cleanupEmptyDirectories($disk, $directory);

            // If directory is empty, delete it
            if (count($disk->files($directory)) === 0 && count($disk->directories($directory)) === 0) {
                $disk->deleteDirectory($directory);
                $this->info("Removed empty directory: {$directory}");
            }
        }
    }
}