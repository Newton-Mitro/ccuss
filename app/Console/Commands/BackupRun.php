<?php

namespace App\Console\Commands;

use App\Audit\Models\DatabaseBackupLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class BackupRun extends Command
{
    protected $signature = 'backup:run';
    protected $description = 'Run database backup';

    public function handle()
    {
        $log = DatabaseBackupLog::create([
            'status' => 'RUNNING',
            'backup_type' => 'FULL',
            'created_by' => null, // If running from CLI, no user
            'started_at' => now(),
        ]);

        try {
            $path = storage_path('app/backups');

            if (!File::exists($path)) {
                File::makeDirectory($path, 0755, true);
            }

            $fileName = 'db_ccuss_' . date('Y_M_d_His') . '.sql';
            $fullPath = $path . DIRECTORY_SEPARATOR . $fileName;

            $host = env('DB_HOST');
            $user = env('DB_USERNAME');
            $pass = env('DB_PASSWORD');
            $db = env('DB_DATABASE');

            // Build mysqldump command with SSL disabled
            $command = "mysqldump --skip-ssl -h {$host} -u {$user} -p{$pass} {$db} > " . escapeshellarg($fullPath) . " 2>&1";

            exec($command, $output, $result);

            if ($result !== 0) {
                $log->update([
                    'status' => 'FAILED',
                    'error' => implode("\n", $output),
                    'completed_at' => now(),
                ]);

                $this->error('Database backup failed.');
                return 1;
            }

            $fileSize = filesize($fullPath);
            $checksum = hash_file('sha256', $fullPath);

            $log->update([
                'status' => 'SUCCESS',
                'file_name' => $fileName,
                'file_path' => $fullPath,
                'file_size' => $fileSize,
                'checksum' => $checksum,
                'duration_seconds' => $log->started_at->diffInSeconds(now()),
                'completed_at' => now(),
                'message' => 'Backup completed successfully'
            ]);

            $this->info('Database backup completed successfully.');
        } catch (\Throwable $e) {
            $log->update([
                'status' => 'FAILED',
                'error' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            $this->error('Database backup failed: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}