<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\RunDatabaseBackup;
use App\SystemAdministration\Models\DatabaseBackupLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DatabaseBackupController extends Controller
{
    public function history(Request $request)
    {
        // Get filters from query parameters
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        // Build query
        $query = DatabaseBackupLog::query();

        if ($search) {
            $query->where('file_name', 'like', "%{$search}%");
        }

        $logs = $query->latest()->paginate($perPage)->withQueryString();

        // Return Inertia response with filters included
        return Inertia::render('system-administration/database-backup/history', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'page' => $request->input('page', 1),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function destroy($id)
    {
        try {
            $log = DatabaseBackupLog::findOrFail($id);
            $disk = Storage::disk('backup');

            if ($log->file_path) {
                // Normalize: remove leading slash
                $relativePath = ltrim($log->file_path, '/');

                // First, try disk deletion
                if ($disk->exists($relativePath)) {
                    $disk->delete($relativePath);
                    \Log::info("Deleted backup via disk: {$relativePath}");
                } else {
                    // fallback absolute path
                    $absolutePath = storage_path('app/backup/' . $relativePath);
                    if (file_exists($absolutePath)) {
                        unlink($absolutePath);
                        \Log::info("Deleted backup via absolute path: {$absolutePath}");
                    } else {
                        \Log::warning("Backup file not found: {$absolutePath}");
                    }
                }
            }

            $log->delete();
            \Log::info("Deleted database log record for backup: {$log->file_path}");

            return redirect()->back()->with('success', 'Backup deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete backup: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete the backup.');
        }
    }
}
