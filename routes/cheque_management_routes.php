<?php

use App\ChequeManagement\Controllers\ChequeBookController;
use App\ChequeManagement\Controllers\ChequeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('cheque-books', ChequeBookController::class);
    Route::resource('cheques', ChequeController::class);

    // Business actions
    Route::post('cheques/{unionCheque}/present', [ChequeController::class, 'markPresented']);
    Route::post('cheques/{unionCheque}/clear', [ChequeController::class, 'markCleared']);
    Route::post('cheques/{unionCheque}/bounce', [ChequeController::class, 'markBounced']);
    Route::post('cheques/{unionCheque}/stop-payment', [ChequeController::class, 'stopPayment']);
});

