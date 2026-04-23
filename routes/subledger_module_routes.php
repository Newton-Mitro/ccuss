<?php

use App\SubledgerModule\Controllers\SubledgerAccountController;
use App\SubledgerModule\Controllers\SubledgerController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('subledgers', SubledgerController::class);
        Route::resource('subledger-accounts', SubledgerAccountController::class);
    });