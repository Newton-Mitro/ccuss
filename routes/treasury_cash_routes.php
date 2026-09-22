<?php

use App\TreasuryAndCash\Controllers\BranchDayController;
use App\TreasuryAndCash\Controllers\BankingController;
use App\TreasuryAndCash\Controllers\CashManagementController;
use App\TreasuryAndCash\Controllers\CashMovementController;
use App\TreasuryAndCash\Controllers\ChequeController;
use App\TreasuryAndCash\Controllers\PettyCashController;
use App\TreasuryAndCash\Controllers\TreasuryDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/treasury-cash', [TreasuryDashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'organization', 'permission:treasury.view'])
    ->name('treasury-cash.dashboard');

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
        Route::get('/vaults/create', [CashManagementController::class, 'createVault'])
            ->middleware('permission:cash_management.create')
            ->name('vaults.create');
        Route::post('/vaults', [CashManagementController::class, 'storeVault'])
            ->middleware('permission:cash_management.create')
            ->name('vaults.store');
        Route::get('/tellers', [CashManagementController::class, 'tellers'])
            ->middleware('permission:cash_management.view')
            ->name('tellers.index');
        Route::get('/tellers/create', [CashManagementController::class, 'createTeller'])
            ->middleware('permission:cash_management.create')
            ->name('tellers.create');
        Route::post('/tellers', [CashManagementController::class, 'storeTeller'])
            ->middleware('permission:cash_management.create')
            ->name('tellers.store');
        Route::get('/teller-sessions', [CashManagementController::class, 'tellerSessions'])
            ->middleware('permission:teller_sessions.view')
            ->name('teller-sessions.index');
        Route::post('/teller-sessions/open', [CashManagementController::class, 'openSession'])
            ->middleware('permission:teller_sessions.open')
            ->name('teller-sessions.open');
        Route::post('/teller-sessions/{tellerSession}/close', [CashManagementController::class, 'closeSession'])
            ->middleware('permission:teller_sessions.close')
            ->name('teller-sessions.close');
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('cash-movements')
    ->name('cash-movements.')
    ->group(function () {
        Route::get('/transfers', [CashMovementController::class, 'cashTransfers'])
            ->middleware('permission:cash_transfers.view')
            ->name('transfers.index');
        Route::post('/transfers/{transfer}/approve', [CashMovementController::class, 'approveCashTransfer'])
            ->middleware('permission:cash_transfers.approve')
            ->name('transfers.approve');
        Route::post('/transfers/{transfer}/complete', [CashMovementController::class, 'completeCashTransfer'])
            ->middleware('permission:cash_transfers.complete')
            ->name('transfers.complete');
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
    });

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('teller-transactions')
    ->name('teller-transactions.')
    ->group(function () {
        Route::get('/', [CashMovementController::class, 'tellerCashTransactions'])
            ->middleware('permission:cash_transactions.view')
            ->name('index');
        Route::post('/{transaction}/post', [CashMovementController::class, 'postTellerCashTransaction'])
            ->middleware('permission:cash_transactions.post')
            ->name('post');
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
        Route::get('/petty-cash-accounts/create', [PettyCashController::class, 'create'])
            ->middleware('permission:petty_cash.create')
            ->name('petty-cash-accounts.create');
        Route::post('/petty-cash-accounts', [PettyCashController::class, 'store'])
            ->middleware('permission:petty_cash.create')
            ->name('petty-cash-accounts.store');
        Route::get('/petty-cash-advance-accounts', [PettyCashController::class, 'advanceAccounts'])
            ->middleware('permission:petty_cash.view')
            ->name('petty-cash-advance-accounts.index');
        Route::get('/petty-cash-transactions/funding', [PettyCashController::class, 'funding'])
            ->middleware('permission:petty_cash.create')
            ->name('petty-cash-transactions.funding');
        Route::get('/petty-cash-transactions', [PettyCashController::class, 'transactions'])
            ->middleware('permission:petty_cash.view')
            ->name('petty-cash-transactions.index');
        Route::post('/petty-cash-transactions/{transaction}/post', [PettyCashController::class, 'postTransaction'])
            ->middleware('permission:petty_cash.expense')
            ->name('petty-cash-transactions.post');
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
        Route::get('/banks/create', [BankingController::class, 'create'])
            ->middleware('permission:banks.create')
            ->name('banks.create');
        Route::post('/banks', [BankingController::class, 'store'])
            ->middleware('permission:banks.create')
            ->name('banks.store');
        Route::get('/bank-accounts', [BankingController::class, 'accounts'])
            ->middleware('permission:bank_accounts.view')
            ->name('bank-accounts.index');
        Route::get('/bank-accounts/create', [BankingController::class, 'createAccount'])
            ->middleware('permission:bank_accounts.create')
            ->name('bank-accounts.create');
        Route::post('/bank-accounts', [BankingController::class, 'storeAccount'])
            ->middleware('permission:bank_accounts.create')
            ->name('bank-accounts.store');
        Route::get('/bank-transactions', [BankingController::class, 'transactions'])
            ->middleware('permission:bank_transactions.view')
            ->name('bank-transactions.index');
        Route::get('/bank-transactions/create', [BankingController::class, 'createTransaction'])
            ->middleware('permission:bank_transactions.create')
            ->name('bank-transactions.create');
        Route::post('/bank-transactions', [BankingController::class, 'storeTransaction'])
            ->middleware('permission:bank_transactions.create')
            ->name('bank-transactions.store');
        Route::post('/bank-transactions/{transaction}/post', [BankingController::class, 'postTransaction'])
            ->middleware('permission:bank_transactions.create')
            ->name('bank-transactions.post');
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
        Route::post('/cheques/{cheque}/issue', [ChequeController::class, 'issue'])
            ->middleware('permission:cheques.issue')
            ->name('cheques.issue');
        Route::post('/cheques/{cheque}/present', [ChequeController::class, 'present'])
            ->middleware('permission:cheques.present')
            ->name('cheques.present');
        Route::post('/cheques/{cheque}/clear', [ChequeController::class, 'clear'])
            ->middleware('permission:cheques.clear')
            ->name('cheques.clear');
        Route::post('/cheques/{cheque}/bounce', [ChequeController::class, 'bounce'])
            ->middleware('permission:cheques.bounce')
            ->name('cheques.bounce');
        Route::post('/cheques/{cheque}/stop', [ChequeController::class, 'stop'])
            ->middleware('permission:cheques.stop')
            ->name('cheques.stop');
        Route::post('/cheques/{cheque}/cancel', [ChequeController::class, 'cancel'])
            ->middleware('permission:cheques.cancel')
            ->name('cheques.cancel');
    });
