<?php

use App\TreasuryAndCash\Controllers\BranchDayController;
use App\TreasuryAndCash\Controllers\BankingController;
use App\TreasuryAndCash\Controllers\CashManagementController;
use App\TreasuryAndCash\Controllers\CashMovementController;
use App\TreasuryAndCash\Controllers\ChequeController;
use App\TreasuryAndCash\Controllers\PettyCashController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('branch-days')
    ->name('branch-days.')
    ->group(function () {
        Route::get('/', [BranchDayController::class, 'index'])
            ->middleware('permission:branch_days.view')
            ->name('index');
        Route::post('/open', [BranchDayController::class, 'open'])
            ->middleware('permission:branch_days.open')
            ->name('open');
        Route::post('/{branchDay}/close', [BranchDayController::class, 'close'])
            ->middleware('permission:branch_days.close')
            ->name('close');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->group(function () {
        Route::get('/vaults', [CashManagementController::class, 'vaults'])
            ->middleware('permission:cash_management.view')
            ->name('vaults.index');
        Route::get('/tellers', [CashManagementController::class, 'tellers'])
            ->middleware('permission:cash_management.view')
            ->name('tellers.index');
        Route::get('/teller-sessions', [CashManagementController::class, 'tellerSessions'])
            ->middleware('permission:teller_sessions.view')
            ->name('teller-sessions.index');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('cash-movements')
    ->name('cash-movements.')
    ->group(function () {
        Route::get('/teller-to-teller-transfer', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->middleware('permission:cash_transfers.create')
            ->name('teller-to-teller-transfer');
        Route::post('/teller-to-teller-transfer', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->middleware('permission:cash_transfers.create')
            ->name('teller-to-teller-transfer.store');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('cash-adjustments')
    ->name('cash-adjustments.')
    ->group(function () {
        Route::get('/teller-cash-adjustment', [CashMovementController::class, 'tellerCashAdjustment'])
            ->middleware('permission:cash_transactions.create')
            ->name('teller-cash-adjustment');
        Route::post('/teller-cash-adjustment', [CashMovementController::class, 'storeTellerCashAdjustment'])
            ->middleware('permission:cash_transactions.create')
            ->name('teller-cash-adjustment.store');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('teller-transactions')
    ->name('teller-transactions.')
    ->group(function () {
        Route::get('/deposit', [CashMovementController::class, 'deposit'])
            ->middleware('permission:cash_transactions.create')
            ->name('deposit');
        Route::post('/deposit', [CashMovementController::class, 'storeDeposit'])
            ->middleware('permission:cash_transactions.create')
            ->name('deposit.store');
        Route::get('/withdrawal', [CashMovementController::class, 'withdrawal'])
            ->middleware('permission:cash_transactions.create')
            ->name('withdrawal');
        Route::post('/withdrawal', [CashMovementController::class, 'storeWithdrawal'])
            ->middleware('permission:cash_transactions.create')
            ->name('withdrawal.store');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->group(function () {
        Route::get('/petty-cash-accounts', [PettyCashController::class, 'accounts'])
            ->middleware('permission:petty_cash.view')
            ->name('petty-cash-accounts.index');
        Route::get('/petty-cash-transactions/funding', [PettyCashController::class, 'funding'])
            ->middleware('permission:petty_cash.create')
            ->name('petty-cash-transactions.funding');
        Route::post('/petty-cash-transactions/funding', [PettyCashController::class, 'storeFunding'])
            ->middleware('permission:petty_cash.create')
            ->name('petty-cash-transactions.funding.store');
        Route::get('/petty-cash-transactions/expense', [PettyCashController::class, 'expense'])
            ->middleware('permission:petty_cash.expense')
            ->name('petty-cash-transactions.expense');
        Route::post('/petty-cash-transactions/expense', [PettyCashController::class, 'storeExpense'])
            ->middleware('permission:petty_cash.expense')
            ->name('petty-cash-transactions.expense.store');
        Route::get('/banks', [BankingController::class, 'banks'])
            ->middleware('permission:banks.view')
            ->name('banks.index');
        Route::get('/bank-accounts', [BankingController::class, 'accounts'])
            ->middleware('permission:bank_accounts.view')
            ->name('bank-accounts.index');
        Route::get('/cheque-books', [ChequeController::class, 'books'])
            ->middleware('permission:cheque_books.view')
            ->name('cheque-books.index');
        Route::get('/cheque-books/create', [ChequeController::class, 'createBook'])
            ->middleware('permission:cheque_books.create')
            ->name('cheque-books.create');
        Route::post('/cheque-books', [ChequeController::class, 'storeBook'])
            ->middleware('permission:cheque_books.create')
            ->name('cheque-books.store');
        Route::get('/cheques', [ChequeController::class, 'cheques'])
            ->middleware('permission:cheques.view')
            ->name('cheques.index');
        Route::put('/cheques/{cheque}', [ChequeController::class, 'update'])
            ->middleware('permission:cheques.issue')
            ->name('cheques.update');
        Route::post('/cheques/{cheque}/issue', [ChequeController::class, 'issue'])->name('cheques.issue');
        Route::post('/cheques/{cheque}/present', [ChequeController::class, 'present'])->name('cheques.present');
        Route::post('/cheques/{cheque}/clear', [ChequeController::class, 'clear'])->name('cheques.clear');
        Route::post('/cheques/{cheque}/bounce', [ChequeController::class, 'bounce'])->name('cheques.bounce');
        Route::post('/cheques/{cheque}/stop', [ChequeController::class, 'stop'])->name('cheques.stop');
        Route::post('/cheques/{cheque}/cancel', [ChequeController::class, 'cancel'])->name('cheques.cancel');
    });
