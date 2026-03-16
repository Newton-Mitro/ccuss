<?php

use App\BranchTreasuryModule\Controllers\BranchDayController;
use App\BranchTreasuryModule\Controllers\CashAdjustmentController;
use App\BranchTreasuryModule\Controllers\CashBalancingController;
use App\BranchTreasuryModule\Controllers\CashDrawerController;
use App\BranchTreasuryModule\Controllers\CashTransactionController;
use App\BranchTreasuryModule\Controllers\TellerSessionController;
use App\BranchTreasuryModule\Controllers\VaultTransferController;
use Illuminate\Support\Facades\Route;


Route::prefix('branch-cash')->group(function () {

    Route::get('branch-day/status', [BranchDayController::class, 'index'])->name('branch-day.index');
    Route::get('branch-day/open', [BranchDayController::class, 'create'])->name('branch-day.open.page');
    Route::post('branch-day/open', [BranchDayController::class, 'open'])->name('branch-day.open');
    Route::post('branch-day/close', [BranchDayController::class, 'branch-day.close'])->name('branch-day.close');
    Route::get('branch-day/history', [BranchDayController::class, 'history'])->name('branch-day.history');

    Route::get('teller-session/open', [TellerSessionController::class, 'create'])->name('teller-session.open.page');
    Route::post('teller-session/open', [TellerSessionController::class, 'openSession'])->name('teller-session.open');
    Route::post('teller-session/{id}/close', [TellerSessionController::class, 'closeSession'])->name('teller-session.close');

    Route::get('cash-drawer/assign', [CashDrawerController::class, 'create'])->name('cash-drawer.assign.page');
    Route::post('cash-drawer/assign', [CashDrawerController::class, 'assignDrawer'])->name('cash-drawer.assign');

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