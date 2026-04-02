<?php

use App\BranchTreasuryModule\Controllers\BranchDayController;
use App\BranchTreasuryModule\Controllers\TellerController;
use App\BranchTreasuryModule\Controllers\TellerSessionController;
use App\BranchTreasuryModule\Controllers\TellerTransactionController;
use App\BranchTreasuryModule\Controllers\VaultController;
use Illuminate\Support\Facades\Route;

Route::resource('vaults', VaultController::class);
Route::resource('tellers', TellerController::class);

Route::prefix('teller-sessions')->name('teller-sessions.')->group(function () {
    Route::get('/', [TellerSessionController::class, 'index'])->name('index');
    Route::get('/create', [TellerSessionController::class, 'create'])->name('create');
    Route::post('/', [TellerSessionController::class, 'store'])->name('store');
    Route::get('/{tellerSession}', [TellerSessionController::class, 'show'])->name('show');
    Route::get('/close/{tellerSession}', [TellerSessionController::class, 'closePage'])->name('close-page');
    Route::post('/close/{tellerSession}', [TellerSessionController::class, 'close'])->name('close');
});

Route::prefix('branch-days')->name('branch-days.')->group(function () {
    Route::get('/', [BranchDayController::class, 'index'])->name('index');
    Route::get('/create', [BranchDayController::class, 'create'])->name('create'); // Move this up
    Route::get('/{branchDay}', [BranchDayController::class, 'show'])->name('show');
    Route::post('/', [BranchDayController::class, 'store'])->name('store');
    Route::put('/{branchDay}/close', [BranchDayController::class, 'closeBranchDay'])->name('close');
});

Route::prefix('branch-cash')->group(function () {

});

Route::middleware(['auth'])->prefix('teller-transactions')->group(function () {
    Route::get('/deposit', [TellerTransactionController::class, 'customerCashReceipt'])
        ->name('teller-transactions.deposit');

    Route::get('/withdrawal', [TellerTransactionController::class, 'customerCashPayment'])
        ->name('teller-transactions.withdrawal');

    Route::get('/customer-collection-ledgers', [TellerTransactionController::class, 'getCustomerCollectionLedgers'])
        ->name('teller-transactions.get-collection-ledgers');

    Route::get('/get-withdrawable-accounts', [TellerTransactionController::class, 'getWithdrawableAccounts'])
        ->name('teller-transactions.get-withdrawable-accounts');
});