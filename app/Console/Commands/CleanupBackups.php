<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CleanupBackups extends Command
{
    protected $signature = 'backup:cleanup {--days=30 : Number of days to keep backups}';
    protected $description = 'Cleanup old database backup files';

    public function handle()
    {
        $days = (int) $this->option('days');
        $path = storage_path('app/backups');

        if (!File::exists($path)) {
            $this->info('Backup directory does not exist. Nothing to clean.');
            return 0;
        }

        $files = File::files($path);
        $deletedCount = 0;

        foreach ($files as $file) {
            $lastModified = Carbon::createFromTimestamp($file->getMTime());

            if (now()->diffInDays($lastModified) > $days) {
                File::delete($file->getRealPath());
                $deletedCount++;
                $this->info("Deleted backup: {$file->getFilename()}");
            }
        }

        $this->info("Cleanup complete. Total deleted: {$deletedCount}");
        return 0;
    }
}