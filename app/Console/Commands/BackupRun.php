<?php

namespace App\Console\Commands;

use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class BackupRun extends Command
{
    protected $signature = 'backup:run';
    protected $description = 'Run database backup';

    public function handle()
    {
        $log = DatabaseBackupLog::create([
            'status' => 'running',
            'backup_type' => 'full',
            'created_by' => null,
            'started_at' => now(),
        ]);

        try {
            $disk = Storage::disk('backup'); // Use the 'backup' disk

            $now = now();
            $year = $now->format('Y');
            $month = $now->format('M');

            // Dynamic folder inside disk: "2026/Apr"
            $relativePath = "{$year}/{$month}";

            // Ensure folder exists on the disk
            if (!$disk->exists($relativePath)) {
                $disk->makeDirectory($relativePath, 0755, true);
            }

            $fileName = 'union_banking_db_' . $now->format('Y_m_d_His') . '.sql';
            $fullPath = $disk->path($relativePath . '/' . $fileName);

            // Database credentials
            $host = env('DB_HOST');
            $user = env('DB_USERNAME');
            $pass = env('DB_PASSWORD');
            $db = env('DB_DATABASE');

            // Dump the database directly into the disk
            $command = sprintf(
                'MYSQL_PWD=%s mysqldump --skip-ssl -h %s -u %s %s > %s 2>&1',
                escapeshellarg($pass),
                escapeshellarg($host),
                escapeshellarg($user),
                escapeshellarg($db),
                escapeshellarg($fullPath)
            );

            exec($command, $output, $result);

            if ($result !== 0 || !file_exists($fullPath)) {
                $log->update([
                    'status' => 'failed',
                    'error' => implode("\n", $output),
                    'completed_at' => now(),
                ]);

                $this->error('❌ Database backup failed.');
                return 1;
            }

            // File metadata
            $fileSize = filesize($fullPath);
            $checksum = hash_file('sha256', $fullPath);

            // Cleanup old backups (keep latest 30)
            $this->cleanupOldBackups($disk, 30);

            // Update log
            $log->update([
                'status' => 'success',
                'file_name' => $fileName,
                'file_path' => $relativePath . '/' . $fileName,
                'file_size' => $fileSize,
                'checksum' => $checksum,
                'duration_seconds' => $log->started_at->diffInSeconds(now()),
                'completed_at' => now(),
                'message' => 'Backup completed successfully',
            ]);

            $this->info('✅ Database backup completed successfully.');

        } catch (\Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            $this->error('❌ Database backup failed: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Remove old backups, keep only latest N files on the disk
     */
    protected function cleanupOldBackups($disk, int $keep = 30): void
    {
        $allFiles = $disk->allFiles();

        // Sort newest first
        usort($allFiles, function ($a, $b) use ($disk) {
            return $disk->lastModified($b) <=> $disk->lastModified($a);
        });

        $filesToDelete = array_slice($allFiles, $keep);

        foreach ($filesToDelete as $file) {
            $disk->delete($file);
        }
    }
}