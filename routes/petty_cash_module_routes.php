<?php

use App\PettyCashModule\Controllers\AdvanceExpenseController;
use App\PettyCashModule\Controllers\PettyCashExpenseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('petty-cash-expenses', PettyCashExpenseController::class);
    Route::resource('advance-expenses', AdvanceExpenseController::class);
});