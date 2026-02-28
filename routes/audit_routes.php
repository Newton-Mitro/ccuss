<?php
use App\Audit\Controllers\AuditController;
use Illuminate\Support\Facades\Route;


Route::prefix('audits')->middleware(['auth'])->group(function () {
    // Global audit list
    Route::get('/', [AuditController::class, 'index'])
        ->name('audits.index');

    // Audit history for a specific model (Voucher, Ledger, etc.)
    Route::get('/model', [AuditController::class, 'model'])
        ->name('audits.model');

    // Single audit batch (deep dive)
    Route::get('/batch/{batchId}', [AuditController::class, 'batch'])
        ->name('audits.batch');
});