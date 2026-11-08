<?php

use App\SystemAdministration\Controllers\OrganizationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('organization/switch', [OrganizationController::class, 'switchOrganization'])
        ->name('organizations.switch');

    Route::post('organizations/{organization}/users', [OrganizationController::class, 'addUser'])
        ->middleware('permission:users.update')
        ->name('organizations.users.store');
    Route::delete('organizations/{organization}/users/{user}', [OrganizationController::class, 'removeUser'])
        ->middleware('permission:users.update')
        ->name('organizations.users.destroy');

    Route::resource('organizations', OrganizationController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update'])
        ->middlewareFor(['index', 'show'], 'permission:organizations.view')
        ->middlewareFor(['edit', 'update'], 'permission:organizations.update');
});
