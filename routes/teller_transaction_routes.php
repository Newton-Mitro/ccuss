<?php
use App\TellerTransactions\Controllers\TellerTransactionController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth'])->group(function () {
    Route::get('/customer-cash-receipt', [TellerTransactionController::class, 'customerCashReceipt'])
        ->name('teller-transaction.customer-cash-receipt');

    Route::get('/customer-cash-payment', [TellerTransactionController::class, 'customerCashPayment'])
        ->name('teller-transaction.customer-cash-payment');

    Route::get('/customer-collection-ledgers', [TellerTransactionController::class, 'getCustomerCollectionLedgers'])
        ->name('teller-transaction.customer-collection-ledgers');


});