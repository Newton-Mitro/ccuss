<?php

use App\ChequeManagement\Controllers\BankChequeBookController;
use App\ChequeManagement\Controllers\BankChequeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('bank-cheque-books', BankChequeBookController::class);
    Route::resource('bank-cheques', BankChequeController::class);

    // Business actions
    Route::post('bank-cheques/{unionCheque}/present', [BankChequeController::class, 'markPresented']);
    Route::post('bank-cheques/{unionCheque}/clear', [BankChequeController::class, 'markCleared']);
    Route::post('bank-cheques/{unionCheque}/bounce', [BankChequeController::class, 'markBounced']);
    Route::post('bank-cheques/{unionCheque}/stop-payment', [BankChequeController::class, 'stopPayment']);
});

