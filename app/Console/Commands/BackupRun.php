<?php

namespace App\Console\Commands;

use App\SystemAdministration\Models\DatabaseBackupLog;
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
            'backup_type' => 'full',
            'created_by' => null,
            'started_at' => now(),
        ]);

        try {
            // 📁 Dynamic folder (Year/Month)
            $now = now();
            $year = $now->format('Y');
            $month = $now->format('M');

            $basePath = storage_path('app/backups');
            $path = $basePath . DIRECTORY_SEPARATOR . $year . DIRECTORY_SEPARATOR . $month;

            // Ensure directory exists
            if (!File::exists($path)) {
                File::makeDirectory($path, 0755, true);
            }

            // 📄 File name
            $fileName = 'db_ccuss_' . $now->format('Y_M_d_His') . '.sql';
            $fullPath = $path . DIRECTORY_SEPARATOR . $fileName;

            // 🛢️ DB credentials
            $host = env('DB_HOST');
            $user = env('DB_USERNAME');
            $pass = env('DB_PASSWORD');
            $db = env('DB_DATABASE');

            // ⚙️ Safer mysqldump (no password exposure)
            $command = sprintf(
                'MYSQL_PWD=%s mysqldump --skip-ssl -h %s -u %s %s > %s 2>&1',
                escapeshellarg($pass),
                escapeshellarg($host),
                escapeshellarg($user),
                escapeshellarg($db),
                escapeshellarg($fullPath)
            );

            exec($command, $output, $result);

            // ❌ Failure handling
            if ($result !== 0) {
                $log->update([
                    'status' => 'FAILED',
                    'error' => implode("\n", $output),
                    'completed_at' => now(),
                ]);

                $this->error('❌ Database backup failed.');
                return 1;
            }

            // 📊 File metadata
            $fileSize = filesize($fullPath);
            $checksum = hash_file('sha256', $fullPath);

            // 🧹 Cleanup old backups
            $this->cleanupOldBackups($basePath, 30);

            // ✅ Success log
            $log->update([
                'status' => 'SUCCESS',
                'file_name' => $fileName,
                'file_path' => "backups/{$year}/{$month}/{$fileName}", // relative path
                'file_size' => $fileSize,
                'checksum' => $checksum,
                'duration_seconds' => $log->started_at->diffInSeconds(now()),
                'completed_at' => now(),
                'message' => 'Backup completed successfully',
            ]);

            $this->info('✅ Database backup completed successfully.');

        } catch (\Throwable $e) {
            $log->update([
                'status' => 'FAILED',
                'error' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            $this->error('❌ Database backup failed: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * 🧹 Keep only latest N backups
     */
    protected function cleanupOldBackups(string $basePath, int $keep = 30): void
    {
        if (!File::exists($basePath)) {
            return;
        }

        $files = File::allFiles($basePath);

        // Sort newest first
        usort($files, function ($a, $b) {
            return $b->getMTime() <=> $a->getMTime();
        });

        // Older files
        $filesToDelete = array_slice($files, $keep);

        foreach ($filesToDelete as $file) {
            File::delete($file->getRealPath());
        }
    }
}