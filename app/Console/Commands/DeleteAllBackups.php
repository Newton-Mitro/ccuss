<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class DeleteAllBackups extends Command
{
    protected $signature = 'backup:delete-all';
    protected $description = 'Delete all database backup files';

    public function handle()
    {
        $path = storage_path('app/backups');

        if (!File::exists($path)) {
            $this->info('Backup directory does not exist. Nothing to delete.');
            return 0;
        }

        $files = File::files($path);
        $deletedCount = 0;

        foreach ($files as $file) {
            File::delete($file->getRealPath());
            $deletedCount++;
            $this->info("Deleted backup: {$file->getFilename()}");
        }

        $this->info("All backups deleted. Total deleted: {$deletedCount}");
        return 0;
    }
}