<?php

use App\SystemAdministration\Controllers\RolePermissionController;
use App\SystemAdministration\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('users')->name('users.')->group(function () {

    // Index, Create, Store
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');

    // Show, Edit, Update, Delete
    Route::get('/{user}', [UserController::class, 'show'])->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');

    // Assign Roles (custom route)
    Route::post('/{user}/roles', [UserController::class, 'updateRoles'])->name('roles.update');
});

Route::prefix('roles')->name('roles.')->group(function () {
    // Show the form to edit permissions for a role
    Route::get('permissions', [RolePermissionController::class, 'index'])
        ->name('index');

    // Update the permissions for a role
    Route::put('{role}/permissions', [RolePermissionController::class, 'update'])
        ->name('update-permissions');
});