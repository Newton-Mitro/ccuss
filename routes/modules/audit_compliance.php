<?php

use App\SystemAdministration\Application\AuditComplianceCatalog;
use App\SystemAdministration\Controllers\AuditComplianceController;
use App\SystemAdministration\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('audits')->middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::get('/', [AuditLogController::class, 'index'])
        ->middleware('permission:activity_logs.view')
        ->name('audits.index');
    Route::get('/model', [AuditLogController::class, 'model'])
        ->middleware('permission:activity_logs.view')
        ->name('audits.model');
    Route::get('/batch/{batchId}', [AuditLogController::class, 'batch'])
        ->middleware('permission:activity_logs.view')
        ->name('audits.batch');
});

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    foreach (AuditComplianceCatalog::dashboards() as $dashboard => $config) {
        Route::get("/{$dashboard}", [AuditComplianceController::class, 'dashboard'])
            ->defaults('dashboard', $dashboard)
            ->middleware("permission:{$dashboard}.view")
            ->name("{$dashboard}.index");
    }

    foreach (AuditComplianceCatalog::registers() as $routeName => $config) {
        $permission = $config['permission'] ?? $routeName;

        Route::prefix($config['path'])
            ->name("{$routeName}.")
            ->group(function () use ($routeName, $permission): void {
                Route::get('/', [AuditComplianceController::class, 'index'])
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.view")
                    ->name('index');
                Route::get('/create', [AuditComplianceController::class, 'create'])
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.create")
                    ->name('create');
                Route::post('/', [AuditComplianceController::class, 'store'])
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.create")
                    ->name('store');
                Route::get('/{record}/edit', [AuditComplianceController::class, 'edit'])
                    ->whereNumber('record')
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.update")
                    ->name('edit');
                Route::get('/{record}', [AuditComplianceController::class, 'show'])
                    ->whereNumber('record')
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.view")
                    ->name('show');
                Route::put('/{record}', [AuditComplianceController::class, 'update'])
                    ->whereNumber('record')
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.update")
                    ->name('update');
                Route::delete('/{record}', [AuditComplianceController::class, 'destroy'])
                    ->whereNumber('record')
                    ->defaults('register', $routeName)
                    ->middleware("permission:{$permission}.delete")
                    ->name('destroy');
            });
    }

    Route::get('/approval-logs', [AuditComplianceController::class, 'approvalLogs'])
        ->middleware('permission:approval-logs.view')
        ->name('approval-logs.index');
});
