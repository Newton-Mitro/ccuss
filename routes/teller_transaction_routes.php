<?php
use App\TellerTransactions\Controllers\TellerTransactionController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth'])->group(function () {
    Route::get('/customer-deposit', [TellerTransactionController::class, 'deposit'])
        ->name('teller-transaction.deposit');

    Route::get('/customer-withdrawal', [TellerTransactionController::class, 'withdrawal'])
        ->name('teller-transaction.withdrawal');


});