<?php

namespace App\Http\Controllers;

use App\Audit\Models\DatabaseBackupLog;
use App\Jobs\RunDatabaseBackup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
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
        return Inertia::render('database-backup/history', [
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

            // Delete the backup file if it exists
            if ($log->file_path && File::exists($log->file_path)) {
                File::delete($log->file_path);
            }

            // Delete the database record
            $log->delete();

            // Redirect back with success message
            return redirect()->back()->with('success', 'Backup deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->back()->with('error', 'Backup record not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete backup: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete the backup. Please try again.');
        }
    }

    public function backup()
    {
        $log = DatabaseBackupLog::create([
            'status' => 'RUNNING',
            'backup_type' => 'FULL',
            'created_by' => auth()->id(),
            'started_at' => now()
        ]);

        RunDatabaseBackup::dispatch($log->id);

        return redirect()->back()->with('success', 'Backup created successfully.');
    }
}
