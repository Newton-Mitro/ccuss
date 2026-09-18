<?php

use App\TreasuryAndCash\Controllers\CashTransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('teller-transactions')
    ->name('teller-transactions.')
    ->group(function () {
        Route::get('/deposit', [CashTransactionController::class, 'deposit'])
            ->name('deposit');
        Route::get('/withdrawal', [CashTransactionController::class, 'withdrawal'])
            ->name('withdrawal');
    });
