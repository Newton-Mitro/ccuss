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

            // Build mysqldump command with SSL disabled and proper escaping
            $command = "mysqldump --skip-ssl -h {$host} -u {$user} -p{$pass} {$db} > " . escapeshellarg($fullPath) . " 2>&1";

            exec($command, $output, $result);

            if ($result !== 0) {
                $log->update([
                    'status' => 'FAILED',
                    'error' => implode("\n", $output),
                    'completed_at' => now(),
                ]);
                return;
            }

            $fileSize = filesize($fullPath);
            $checksum = hash_file('sha256', $fullPath);

            $log->update([
                'status' => 'SUCCESS',
                'file_name' => $fileName,
                'file_path' => $fullPath,
                'file_size' => $fileSize,
                'checksum' => $checksum,
                'duration_seconds' => $start->diffInSeconds(now()),
                'completed_at' => now(),
                'message' => 'Backup completed successfully'
            ]);

        } catch (\Throwable $e) {
            $log->update([
                'status' => 'FAILED',
                'error' => $e->getMessage(),
                'completed_at' => now(),
            ]);
        }
    }
}