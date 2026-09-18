<?php

use App\TreasuryAndCash\Controllers\BankAccountController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::get('/bank-accounts', [BankAccountController::class, 'index'])
        ->name('bank-accounts.index')
        ->middleware('permission:banking.view');
});
