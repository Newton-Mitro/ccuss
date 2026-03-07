<?php
use App\TellerTransactions\Controllers\TellerTransactionController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth'])->group(function () {
    Route::get('/deposit', [TellerTransactionController::class, 'customerCashReceipt'])
        ->name('transaction.deposit');

    Route::get('/withdrawal', [TellerTransactionController::class, 'customerCashPayment'])
        ->name('transaction.withdrawal');

    Route::get('/customer-collection-ledgers', [TellerTransactionController::class, 'getCustomerCollectionLedgers'])
        ->name('teller-transaction.customer-collection-ledgers');

    Route::get('/get-withdrawable-accounts', [TellerTransactionController::class, 'getWithdrawableAccounts'])
        ->name('teller-transaction.customer-withdrawable-accounts');
});