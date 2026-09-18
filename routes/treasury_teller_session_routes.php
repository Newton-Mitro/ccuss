<?php

use App\TreasuryAndCash\Controllers\TellerSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('teller-sessions')->name('teller-sessions.')
    ->group(function () {
        Route::get('/', [TellerSessionController::class, 'index'])->name('index')->middleware('permission:cash_management.view');
        Route::get('/create', [TellerSessionController::class, 'create'])->name('create')->middleware('permission:cash_management.create');
        Route::post('/', [TellerSessionController::class, 'store'])->name('store')->middleware('permission:cash_management.create');
        Route::get('/close/{tellerSession}', [TellerSessionController::class, 'closePage'])->name('close-page')->middleware('permission:cash_management.update');
        Route::post('/close/{tellerSession}', [TellerSessionController::class, 'close'])->name('close')->middleware('permission:cash_management.update');
        Route::get('/{tellerSession}', [TellerSessionController::class, 'show'])->name('show')->middleware('permission:cash_management.view');
    });
