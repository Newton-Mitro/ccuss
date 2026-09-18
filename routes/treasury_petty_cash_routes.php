<?php

use App\TreasuryAndCash\Controllers\PettyCashController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::get('/petty-cash-accounts', [PettyCashController::class, 'index'])
        ->name('petty-cash.index')
        ->middleware('permission:petty_cash.view');

    Route::get('/petty-cash-advance-accounts', [PettyCashController::class, 'index'])
        ->name('petty-cash-advance-accounts.index')
        ->middleware('permission:petty_cash.view');
});
