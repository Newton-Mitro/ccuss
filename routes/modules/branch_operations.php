<?php

use App\TreasuryAndCash\Controllers\BranchCashSummaryController;
use App\TreasuryAndCash\Controllers\BranchDayController;
use App\TreasuryAndCash\Controllers\BranchOperationsDashboardController;
use App\TreasuryAndCash\Controllers\CashManagementController;
use App\TreasuryAndCash\Controllers\CashMovementController;
use Illuminate\Support\Facades\Route;

Route::get('/branch-operations', [BranchOperationsDashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'organization', 'permission:treasury.view'])
    ->name('branch-operations.dashboard');

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('branch-days')
    ->name('branch-days.')
    ->group(function () {
        Route::get('/', [BranchDayController::class, 'index'])
            ->middleware('permission:branch_days.view')
            ->name('index');
        Route::get('/create', [BranchDayController::class, 'create'])
            ->middleware('permission:branch_days.open')
            ->name('create');
        Route::post('/open', [BranchDayController::class, 'open'])
            ->middleware('permission:branch_days.open')
            ->name('open');
        Route::post('/{branchDay}/close', [BranchDayController::class, 'close'])
            ->middleware('permission:branch_days.close')
            ->name('close');
    });

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::get('/branch-cash-summaries', [BranchCashSummaryController::class, 'index'])
        ->middleware('permission:cash_transactions.view')
        ->name('branch-cash-summaries.index');
    Route::post('/branch-days/{branchDay}/cash-summary', [BranchCashSummaryController::class, 'calculate'])
        ->middleware('permission:cash_transactions.post')
        ->name('branch-cash-summaries.calculate');

    Route::get('/tellers', [CashManagementController::class, 'tellers'])
        ->middleware('permission:cash_management.view')
        ->name('tellers.index');
    Route::get('/tellers/create', [CashManagementController::class, 'createTeller'])
        ->middleware('permission:cash_management.create')
        ->name('tellers.create');
    Route::post('/tellers', [CashManagementController::class, 'storeTeller'])
        ->middleware('permission:cash_management.create')
        ->name('tellers.store');
    Route::get('/tellers/{teller}', [CashManagementController::class, 'showTeller'])
        ->middleware('permission:cash_management.view')
        ->name('tellers.show');
    Route::get('/tellers/{teller}/edit', [CashManagementController::class, 'editTeller'])
        ->middleware('permission:cash_management.update')
        ->name('tellers.edit');
    Route::put('/tellers/{teller}', [CashManagementController::class, 'updateTeller'])
        ->middleware('permission:cash_management.update')
        ->name('tellers.update');

    Route::get('/teller-sessions', [CashManagementController::class, 'tellerSessions'])
        ->middleware('permission:teller_sessions.view')
        ->name('teller-sessions.index');
    Route::get('/teller-sessions/create', [CashManagementController::class, 'createSession'])
        ->middleware('permission:teller_sessions.open')
        ->name('teller-sessions.create');
    Route::post('/teller-sessions/open', [CashManagementController::class, 'openSession'])
        ->middleware('permission:teller_sessions.open')
        ->name('teller-sessions.open');
    Route::post('/teller-sessions/{tellerSession}/close', [CashManagementController::class, 'closeSession'])
        ->middleware('permission:teller_sessions.close')
        ->name('teller-sessions.close');
});

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('cash-adjustments')
    ->name('cash-adjustments.')
    ->group(function () {
        Route::get('/', [CashMovementController::class, 'cashAdjustments'])
            ->middleware('permission:cash_transactions.view')
            ->name('index');
        Route::post('/{adjustment}/approve', [CashMovementController::class, 'approveCashAdjustment'])
            ->middleware('permission:cash_transactions.post')
            ->name('index.approve');
        Route::post('/{adjustment}/post', [CashMovementController::class, 'postCashAdjustment'])
            ->middleware('permission:cash_transactions.post')
            ->name('index.post');
        Route::get('/teller-cash-adjustment', [CashMovementController::class, 'tellerCashAdjustment'])
            ->middleware('permission:cash_transactions.create')
            ->name('teller-cash-adjustment');
        Route::post('/teller-cash-adjustment', [CashMovementController::class, 'storeTellerCashAdjustment'])
            ->middleware('permission:cash_transactions.create')
            ->name('teller-cash-adjustment.store');

        Route::get('/vault-adjustments', [CashMovementController::class, 'cashAdjustments'])
            ->middleware('permission:cash_transactions.view')
            ->name('vault-adjustments.index');
        Route::get('/vault-adjustments/create', [CashMovementController::class, 'tellerCashAdjustment'])
            ->middleware('permission:cash_transactions.create')
            ->name('vault-adjustments.create');
        Route::post('/vault-adjustments/create', [CashMovementController::class, 'storeTellerCashAdjustment'])
            ->middleware('permission:cash_transactions.create')
            ->name('vault-adjustments.store');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('teller-transaction-lists')
    ->name('teller-transactions.')
    ->group(function () {
        Route::get('/', [CashMovementController::class, 'tellerCashTransactions'])
            ->middleware('permission:cash_transactions.view')
            ->name('index');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('teller-transactions')
    ->name('teller-transactions.')
    ->group(function () {
        Route::patch('/{transaction}', [CashMovementController::class, 'updateTellerCashTransaction'])
            ->middleware('permission:cash_transactions.update')
            ->name('update');
        Route::post('/{transaction}/cancel', [CashMovementController::class, 'cancelTellerCashTransaction'])
            ->middleware('permission:cash_transactions.cancel')
            ->name('cancel');
        Route::post('/{transaction}/reverse', [CashMovementController::class, 'reverseTellerCashTransaction'])
            ->middleware('permission:cash_transactions.reverse')
            ->name('reverse');
        Route::post('/{transaction}/post', [CashMovementController::class, 'postTellerCashTransaction'])
            ->middleware('permission:cash_transactions.post')
            ->name('post');
        Route::get('/deposit', [CashMovementController::class, 'deposit'])
            ->middleware('permission:cash_transactions.create')
            ->name('deposit');
        Route::post('/deposit', [CashMovementController::class, 'storeDeposit'])
            ->middleware('permission:cash_transactions.create')
            ->name('deposit.store');
        Route::get('/deposit/accounts/search', [CashMovementController::class, 'searchCustomerDepositAccounts'])
            ->middleware('permission:cash_transactions.create,financial.transactions.create')
            ->name('deposit.accounts.search');
        Route::get('/customer-deposit', [CashMovementController::class, 'customerDeposit'])
            ->middleware('permission:cash_transactions.create')
            ->name('customer-deposit');
        Route::post('/customer-deposit', [CashMovementController::class, 'storeCustomerDeposit'])
            ->middleware('permission:cash_transactions.create')
            ->name('customer-deposit.store');
        Route::get('/withdrawal', [CashMovementController::class, 'withdrawal'])
            ->middleware('permission:cash_transactions.create')
            ->name('withdrawal');
        Route::post('/withdrawal', [CashMovementController::class, 'storeWithdrawal'])
            ->middleware('permission:cash_transactions.create')
            ->name('withdrawal.store');
    });
