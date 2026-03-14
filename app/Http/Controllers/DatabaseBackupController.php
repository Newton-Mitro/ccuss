<?php

namespace App\Http\Controllers;

use App\Audit\Models\DatabaseBackupLog;
use App\Jobs\RunDatabaseBackup;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class DatabaseBackupController extends Controller
{
    public function index()
    {
        return Inertia::render('database-backup/backup', [
        ]);
    }

    public function run()
    {
        $log = DatabaseBackupLog::create([
            'status' => 'RUNNING',
            'backup_type' => 'FULL',
            'created_by' => auth()->id(),
            'started_at' => now()
        ]);

        RunDatabaseBackup::dispatch($log->id);

        return response()->json([
            'success' => true,
            'message' => 'Backup started. You will be notified when it finishes.'
        ]);
    }

    public function history()
    {
        $logs = DatabaseBackupLog::latest()
            ->paginate(20);

        return Inertia::render('database-backup/history', [
            'logs' => $logs
        ]);
    }

    public function download($id)
    {
        $log = DatabaseBackupLog::findOrFail($id);

        return response()->download($log->file_path);
    }

    public function backup()
    {
        try {
            $path = storage_path('app/backups');

            if (!File::exists($path)) {
                File::makeDirectory($path, 0755, true);
            }

            $filename = 'db_ccuss_' . date('Y_M_d') . '.sql';
            $fullPath = storage_path("app/backups/$filename");

            $host = env('DB_HOST');
            $user = env('DB_USERNAME');
            $pass = env('DB_PASSWORD');
            $db = env('DB_DATABASE');

            // Build mysqldump command with SSL disabled
            $command = "mysqldump --skip-ssl -h $host -u $user -p$pass $db > " . escapeshellarg($fullPath) . " 2>&1";

            exec($command, $output, $result);

            if ($result !== 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Database backup failed',
                    'error' => implode("\n", $output),
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Database backup created successfully',
                'file' => asset("storage/app/backups/$filename"),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database backup failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
