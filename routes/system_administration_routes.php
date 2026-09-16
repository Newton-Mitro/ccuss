<?php

use App\SystemAdministration\Controllers\AuditLogController;
use App\SystemAdministration\Controllers\BranchController;
use App\SystemAdministration\Controllers\DatabaseBackupController;
use App\SystemAdministration\Controllers\OrganizationController;
use App\SystemAdministration\Controllers\RolePermissionController;
use App\SystemAdministration\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->prefix('users')->name('users.')->group(function () {
    Route::get('/search', [UserController::class, 'searchUsers'])
        ->middleware('permission:users.search')
        ->name('search');
    Route::get('/', [UserController::class, 'index'])
        ->middleware('permission:users.view')
        ->name('index');
    Route::get('/create', [UserController::class, 'create'])
        ->middleware('permission:users.create')
        ->name('create');
    Route::post('/', [UserController::class, 'store'])
        ->middleware('permission:users.create')
        ->name('store');
    Route::get('/{user}', [UserController::class, 'show'])
        ->middleware('permission:users.view')
        ->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])
        ->middleware('permission:users.update')
        ->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])
        ->middleware('permission:users.update')
        ->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete')
        ->name('destroy');
});

Route::middleware(['auth', 'verified'])->prefix('roles')->name('roles.')->group(function () {
    Route::get('permissions', [RolePermissionController::class, 'index'])
        ->middleware('permission:role_permissions.view')
        ->name('index');
    Route::put('{roleId}/permissions', [RolePermissionController::class, 'update'])
        ->middleware('permission:role_permissions.update')
        ->name('update-permissions');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('organization/switch', [OrganizationController::class, 'switchOrganization'])
        ->name('organizations.switch');

    Route::resource('organizations', OrganizationController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update'])
        ->middlewareFor(['index', 'show'], 'permission:organizations.view')
        ->middlewareFor(['edit', 'update'], 'permission:organizations.update');
});

Route::middleware(['auth', 'verified', 'organization'])->prefix('organizations')
    ->group(function () {
        Route::resource('branches', BranchController::class)
            ->middlewareFor(['index', 'show'], 'permission:branches.view')
            ->middlewareFor(['create', 'store'], 'permission:branches.create')
            ->middlewareFor(['edit', 'update'], 'permission:branches.update')
            ->middlewareFor('destroy', 'permission:branches.delete');
    });

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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('database/backups', [DatabaseBackupController::class, 'history'])
        ->middleware('permission:database_backups.view')
        ->name('backup.history');
    Route::delete('/database/backups/{id}', [DatabaseBackupController::class, 'destroy'])
        ->middleware('permission:database_backups.delete')
        ->name('backup.destroy');
});
