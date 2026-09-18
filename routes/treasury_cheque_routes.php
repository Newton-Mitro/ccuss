<?php

use App\TreasuryAndCash\Controllers\ChequeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::get('/cheque-books', [ChequeController::class, 'index'])
        ->name('cheque-books.index')
        ->middleware('permission:cheques.view');

    Route::get('/cheques', [ChequeController::class, 'index'])
        ->name('cheques.index')
        ->middleware('permission:cheques.view');
});
