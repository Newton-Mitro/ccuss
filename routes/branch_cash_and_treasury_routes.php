<?php

use App\BranchTreasuryModule\Controllers\BranchDayController;
use App\BranchTreasuryModule\Controllers\CashAdjustmentController;
use App\BranchTreasuryModule\Controllers\CashBalancingController;
use App\BranchTreasuryModule\Controllers\CashTransactionController;
use App\BranchTreasuryModule\Controllers\TellerController;
use App\BranchTreasuryModule\Controllers\TellerSessionController;
use App\BranchTreasuryModule\Controllers\TellerTransactionController;
use App\BranchTreasuryModule\Controllers\VaultController;
use App\BranchTreasuryModule\Controllers\VaultTransferController;
use Illuminate\Support\Facades\Route;


Route::get('sop', [BranchDayController::class, 'sop'])->name('branch-treasury.sop');

Route::resource('vaults', VaultController::class);
Route::resource('tellers', TellerController::class);

Route::prefix('teller-sessions')->name('teller-sessions.')->middleware(['auth'])->group(function () {
    Route::get('/', [TellerSessionController::class, 'index'])->name('index');
    // Route::get('/{id}', [TellerSessionController::class, 'show'])->name('show');
    Route::get('/create', [TellerSessionController::class, 'create'])->name('create');
    Route::post('/open', [TellerSessionController::class, 'openSession'])->name('open');
    Route::post('/{id}/close', [TellerSessionController::class, 'closeSession'])->name('close');
});

Route::prefix('branch-cash')->group(function () {
    Route::get('branch-day/status', [BranchDayController::class, 'index'])->name('branch-day.index');
    Route::get('branch-day/open', [BranchDayController::class, 'create'])->name('branch-day.open.page');
    Route::post('branch-day/open', [BranchDayController::class, 'open'])->name('branch-day.open');
    Route::post('branch-day/close', [BranchDayController::class, 'close'])->name('branch-day.close');
    Route::get('branch-day/history', [BranchDayController::class, 'history'])->name('branch-day.history');

    Route::get('vault-transfer/teller', [VaultTransferController::class, 'createVaultToTeller'])->name('vault.transfer.teller.page');
    Route::post('vault-transfer/teller', [VaultTransferController::class, 'vaultToTeller'])->name('vault.transfer.teller');
    Route::post('vault-transfer/return', [VaultTransferController::class, 'tellerToVault'])->name('vault.transfer.return');
    Route::post('vault-transfer/vault', [VaultTransferController::class, 'vaultToVault'])->name('vault.transfer.vault');

    Route::get('cash-transaction', [CashTransactionController::class, 'index'])->name('cash.transaction.page');
    Route::post('cash-transaction/in', [CashTransactionController::class, 'storeCashIn'])->name('cash.transaction.in');
    Route::post('cash-transaction/out', [CashTransactionController::class, 'storeCashOut'])->name('cash.transaction.out');

    Route::get('cash-balancing', [CashBalancingController::class, 'create'])->name('cash.balance.page');
    Route::post('cash/balance', [CashBalancingController::class, 'balance'])->name('cash.balance');

    Route::get('cash-adjustment', [CashAdjustmentController::class, 'index'])->name('cash.adjustment.page');
    Route::post('cash/adjustment', [CashAdjustmentController::class, 'approveAdjustment'])->name('cash.adjustment.approve');
});

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