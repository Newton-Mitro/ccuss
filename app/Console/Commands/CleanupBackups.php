<?php

namespace App\Console\Commands;

use App\SystemAdministration\Models\DatabaseBackupLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CleanupBackups extends Command
{
    protected $signature = 'backup:cleanup {--days=30 : Number of days to keep backups}';
    protected $description = 'Cleanup old database backup files and logs';

    public function handle()
    {
        $days = (int) $this->option('days');
        $basePath = storage_path('app/backups');

        if (!File::exists($basePath)) {
            $this->info('Backup directory does not exist. Nothing to clean.');
            return 0;
        }

        $deletedFiles = 0;
        $deletedLogs = 0;

        // 📂 Get all files recursively (important!)
        $files = File::allFiles($basePath);

        foreach ($files as $file) {
            $lastModified = Carbon::createFromTimestamp($file->getMTime());

            if ($lastModified->lt(now()->subDays($days))) {
                $relativePath = str_replace(
                    storage_path('app') . DIRECTORY_SEPARATOR,
                    '',
                    $file->getRealPath()
                );

                // 🧹 Delete file
                File::delete($file->getRealPath());
                $deletedFiles++;

                // 🗑️ Delete corresponding DB log
                $deletedLogs += DatabaseBackupLog::where('file_path', $relativePath)->delete();

                $this->info("Deleted backup: {$relativePath}");
            }
        }

        // 🧼 Remove empty directories (Year/Month cleanup)
        $this->cleanupEmptyDirectories($basePath);

        $this->info("Cleanup complete.");
        $this->info("Files deleted: {$deletedFiles}");
        $this->info("Logs deleted: {$deletedLogs}");

        return 0;
    }

    /**
     * 🧼 Remove empty folders recursively
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