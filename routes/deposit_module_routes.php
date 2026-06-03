<?php

use App\DepositModule\Controllers\DepositAccountController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/deposit-accounts/create', [DepositAccountController::class, 'create'])->name('create');
});


