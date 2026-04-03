<?php

use App\PettyCashModule\Controllers\AdvancePettyCashController;
use App\PettyCashModule\Controllers\PettyCashAccountController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('petty-cash-accounts', PettyCashAccountController::class);
    Route::resource('advance-petty-cashes', AdvancePettyCashController::class);
});