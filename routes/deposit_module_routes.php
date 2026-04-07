<?php

use App\DepositModule\Controllers\UnionChequeBookController;
use App\DepositModule\Controllers\UnionChequeController;
use Illuminate\Support\Facades\Route;

Route::apiResource('cheque-books', UnionChequeBookController::class);
Route::apiResource('cheques', UnionChequeController::class);

// Business actions
Route::post('cheques/{unionCheque}/present', [UnionChequeController::class, 'markPresented']);
Route::post('cheques/{unionCheque}/clear', [UnionChequeController::class, 'markCleared']);
Route::post('cheques/{unionCheque}/bounce', [UnionChequeController::class, 'markBounced']);
Route::post('cheques/{unionCheque}/stop-payment', [UnionChequeController::class, 'stopPayment']);