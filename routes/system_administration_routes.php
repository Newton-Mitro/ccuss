<?php

use App\Audit\Controllers\AuditLogController;
use App\SystemAdministration\Controllers\OrganizationController;
use App\SystemAdministration\Controllers\RolePermissionController;
use App\SystemAdministration\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{user}', [UserController::class, 'show'])->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    Route::post('/{user}/roles', [UserController::class, 'updateRoles'])->name('roles.update');
});

Route::prefix('roles')->name('roles.')->group(function () {
    Route::get('permissions', [RolePermissionController::class, 'index'])->name('index');
    Route::put('{role}/permissions', [RolePermissionController::class, 'update'])->name('update-permissions');
});

Route::resource('organizations', OrganizationController::class);

Route::prefix('audits')->middleware(['auth'])->group(function () {
    Route::get('/', [AuditLogController::class, 'index'])->name('audits.index');
    Route::get('/model', [AuditLogController::class, 'model'])->name('audits.model');
    Route::get('/batch/{batchId}', [AuditLogController::class, 'batch'])->name('audits.batch');
});