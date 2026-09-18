<?php

use App\TreasuryAndCash\Controllers\TellerController;
use App\TreasuryAndCash\Controllers\VaultController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::resource('vaults', VaultController::class)
        ->middlewareFor(['index', 'show'], 'permission:cash_management.view')
        ->middlewareFor(['create', 'store'], 'permission:cash_management.create')
        ->middlewareFor(['edit', 'update'], 'permission:cash_management.update')
        ->middlewareFor('destroy', 'permission:cash_management.delete');
    Route::resource('tellers', TellerController::class)
        ->middlewareFor(['index', 'show'], 'permission:cash_management.view')
        ->middlewareFor(['create', 'store'], 'permission:cash_management.create')
        ->middlewareFor(['edit', 'update'], 'permission:cash_management.update')
        ->middlewareFor('destroy', 'permission:cash_management.delete');
});
