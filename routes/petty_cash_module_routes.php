<?php

use App\PettyCashModule\Controllers\PettyCashAccountController;
use App\PettyCashModule\Controllers\PettyCashAdvanceAccountController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('petty-cash-accounts', PettyCashAccountController::class);
    Route::resource('petty-cash-advance-accounts', PettyCashAdvanceAccountController::class);
});