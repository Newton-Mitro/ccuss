<?php

namespace App\Jobs;

use App\Audit\Models\DatabaseBackupLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;

class RunDatabaseBackup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $logId;

    public function __construct($logId)
    {
        $this->logId = $logId;
    }

    public function handle()
    {
        $log = DatabaseBackupLog::find($this->logId);
        $start = now();

        try {
            // 📁 Base + dynamic folder (Year/Month)
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

            // ⚙️ mysqldump command
            $command = "mysqldump --skip-ssl -h {$host} -u {$user} -p{$pass} {$db} > " . escapeshellarg($fullPath) . " 2>&1";

            exec($command, $output, $result);

            // ❌ Failure
            if ($result !== 0) {
                $log->update([
                    'status' => 'FAILED',
                    'error' => implode("\n", $output),
                    'completed_at' => now(),
                ]);
                return;
            }

            // 📊 File metadata
            $fileSize = filesize($fullPath);
            $checksum = hash_file('sha256', $fullPath);

            // 🧹 Cleanup old backups (keep latest 30)
            $this->cleanupOldBackups($basePath, 30);

            // ✅ Success log
            $log->update([
                'status' => 'SUCCESS',
                'file_name' => $fileName,
                'file_path' => "backups/{$year}/{$month}/{$fileName}", // relative path (better)
                'file_size' => $fileSize,
                'checksum' => $checksum,
                'duration_seconds' => $start->diffInSeconds(now()),
                'completed_at' => now(),
                'message' => 'Backup completed successfully',
            ]);

        } catch (\Throwable $e) {
            $log->update([
                'status' => 'FAILED',
                'error' => $e->getMessage(),
                'completed_at' => now(),
            ]);
        }
    }

    /**
     * 🧹 Remove old backups, keep only latest N files
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

        // Slice older files
        $filesToDelete = array_slice($files, $keep);

        foreach ($filesToDelete as $file) {
            File::delete($file->getRealPath());
        }
    }
}