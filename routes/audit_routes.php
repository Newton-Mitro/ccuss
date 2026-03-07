<?php
use App\Audit\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;


Route::prefix('audits')->middleware(['auth'])->group(function () {
    // Global audit list
    Route::get('/', [AuditLogController::class, 'index'])
        ->name('audits.index');

    // Audit history for a specific model (Voucher, Ledger, etc.)
    Route::get('/model', [AuditLogController::class, 'model'])
        ->name('audits.model');

    // Single audit batch (deep dive)
    Route::get('/batch/{batchId}', [AuditLogController::class, 'batch'])
        ->name('audits.batch');
});