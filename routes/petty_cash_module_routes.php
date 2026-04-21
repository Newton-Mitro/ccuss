<?php

use App\PettyCashModule\Controllers\PettyCashAccountController;
use App\PettyCashModule\Controllers\PettyCashAdvanceAccountController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('petty-cash-accounts', PettyCashAccountController::class);

    Route::get('petty-cash-accounts/replenishment/create', [PettyCashAccountController::class, 'createPettyCashReplenishment'])->name('petty-cash-accounts.replenishment');
    Route::get('petty-cash-accounts/expense/create', [PettyCashAccountController::class, 'createPettyCashExpense'])->name('petty-cash-accounts.expense');

    Route::resource('petty-cash-advance-accounts', PettyCashAdvanceAccountController::class);

    Route::get('petty-cash-advance-accounts/advance-entry/create', [PettyCashAdvanceAccountController::class, 'createPettyCashAdvanceEntry'])->name('petty-cash-advance-accounts.advance-entry');
});