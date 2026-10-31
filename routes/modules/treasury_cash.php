<?php

use App\TreasuryAndCash\Controllers\BankingController;
use App\TreasuryAndCash\Controllers\BankReconciliationController;
use App\TreasuryAndCash\Controllers\BranchCashSummaryController;
use App\TreasuryAndCash\Controllers\CashCountController;
use App\TreasuryAndCash\Controllers\CashManagementController;
use App\TreasuryAndCash\Controllers\CashMovementController;
use App\TreasuryAndCash\Controllers\ChequeClearingController;
use App\TreasuryAndCash\Controllers\ChequeController;
use App\TreasuryAndCash\Controllers\PettyCashController;
use App\TreasuryAndCash\Controllers\TreasuryDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/treasury-cash', [TreasuryDashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'organization', 'permission:treasury.view'])
    ->name('treasury-cash.dashboard');

Route::middleware(['auth', 'verified', 'organization'])
    ->group(function () {
        Route::get('/cash-counts', [CashCountController::class, 'index'])
            ->middleware('permission:cash_transactions.view')
            ->name('cash-counts.index');
        Route::post('/cash-counts', [CashCountController::class, 'store'])
            ->middleware('permission:cash_transactions.create')
            ->name('cash-counts.store');
        Route::get('/cash-denominations', [CashCountController::class, 'denominations'])
            ->middleware('permission:cash_transactions.view')
            ->name('cash-denominations.index');
        Route::get('/cash-denominations/create', [CashCountController::class, 'createDenomination'])
            ->middleware('permission:cash_transactions.create')
            ->name('cash-denominations.create');
        Route::get('/cash-denominations/{denomination}/edit', [CashCountController::class, 'editDenomination'])
            ->middleware('permission:cash_transactions.update')
            ->name('cash-denominations.edit');
        Route::post('/cash-denominations', [CashCountController::class, 'storeDenomination'])
            ->middleware('permission:cash_transactions.create')
            ->name('cash-denominations.store');
        Route::put('/cash-denominations/{denomination}', [CashCountController::class, 'updateDenomination'])
            ->middleware('permission:cash_transactions.update')
            ->name('cash-denominations.update');
        Route::get('/vault-counts', [CashCountController::class, 'index'])
            ->middleware('permission:cash_transactions.view')
            ->name('vault-counts.index');
        Route::post('/vault-counts', [CashCountController::class, 'store'])
            ->middleware('permission:cash_transactions.create')
            ->name('vault-counts.store');
        Route::get('/bank-reconciliations', [BankReconciliationController::class, 'index'])->middleware('permission:bank_transactions.view')->name('bank-reconciliations.index');
        Route::post('/bank-reconciliations', [BankReconciliationController::class, 'store'])->middleware('permission:bank_transactions.create')->name('bank-reconciliations.store');
        Route::post('/bank-reconciliations/{bank_reconciliation}/finalize', [BankReconciliationController::class, 'finalize'])->middleware('permission:bank_transactions.post')->name('bank-reconciliations.finalize');
        Route::get('/cheque-clearings', [ChequeClearingController::class, 'index'])->middleware('permission:cheques.view')->name('cheque-clearings.index');
        Route::get('/cheque-clearings/create', [ChequeClearingController::class, 'create'])->middleware('permission:cheques.present')->name('cheque-clearings.create');
        Route::post('/cheque-clearings', [ChequeClearingController::class, 'store'])->middleware('permission:cheques.present')->name('cheque-clearings.store');
        Route::get('/cheque-clearings/create', [ChequeClearingController::class, 'create'])->middleware('permission:cheques.present')->name('cheque-clearings.create');
        Route::post('/cheque-clearings/{cheque_clearing}/{action}', [ChequeClearingController::class, 'transition'])->name('cheque-clearings.transition');
        Route::get('/vaults', [CashManagementController::class, 'vaults'])
            ->middleware('permission:cash_management.view')
            ->name('vaults.index');
        Route::get('/vaults/create', [CashManagementController::class, 'createVault'])
            ->middleware('permission:cash_management.create')
            ->name('vaults.create');
        Route::post('/vaults', [CashManagementController::class, 'storeVault'])
            ->middleware('permission:cash_management.create')
            ->name('vaults.store');
        Route::get('/vaults/{vault}', [CashManagementController::class, 'showVault'])
            ->middleware('permission:cash_management.view')
            ->name('vaults.show');
        Route::get('/vaults/{vault}/edit', [CashManagementController::class, 'editVault'])
            ->middleware('permission:cash_management.update')
            ->name('vaults.edit');
        Route::put('/vaults/{vault}', [CashManagementController::class, 'updateVault'])
            ->middleware('permission:cash_management.update')
            ->name('vaults.update');
        Route::get('/vault-sessions', [CashManagementController::class, 'vaultSessions'])
            ->middleware('permission:vault_sessions.view')
            ->name('vault-sessions.index');
        Route::get('/vault-sessions/create', [CashManagementController::class, 'createVaultSession'])
            ->middleware('permission:vault_sessions.open')
            ->name('vault-sessions.create');
        Route::post('/vault-sessions/open', [CashManagementController::class, 'openVaultSession'])
            ->middleware('permission:vault_sessions.open')
            ->name('vault-sessions.open');
        Route::post('/vault-sessions/{vaultSession}/close', [CashManagementController::class, 'closeVaultSession'])
            ->middleware('permission:vault_sessions.close')
            ->name('vault-sessions.close');

        Route::get('/vault-cash-position', [BranchCashSummaryController::class, 'index'])
            ->middleware('permission:cash_transactions.view')
            ->name('vault-cash-position.index');
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
        Route::get('/teller-to-teller', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->defaults('transferType', 'TELLER_TO_TELLER')
            ->middleware('permission:cash_transfers.create')
            ->name('teller-to-teller');
        Route::post('/teller-to-teller', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->defaults('transferType', 'TELLER_TO_TELLER')
            ->middleware('permission:cash_transfers.create')
            ->name('teller-to-teller.store');
        Route::get('/vault-to-teller', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->defaults('transferType', 'VAULT_TO_TELLER')
            ->middleware('permission:cash_transfers.create')
            ->name('vault-to-teller');
        Route::post('/vault-to-teller', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->defaults('transferType', 'VAULT_TO_TELLER')
            ->middleware('permission:cash_transfers.create')
            ->name('vault-to-teller.store');
        Route::get('/teller-to-vault', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->defaults('transferType', 'TELLER_TO_VAULT')
            ->middleware('permission:cash_transfers.create')
            ->name('teller-to-vault');
        Route::post('/teller-to-vault', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->defaults('transferType', 'TELLER_TO_VAULT')
            ->middleware('permission:cash_transfers.create')
            ->name('teller-to-vault.store');
        Route::get('/vault-to-vault', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->defaults('transferType', 'VAULT_TO_VAULT')
            ->middleware('permission:cash_transfers.create')
            ->name('vault-to-vault');
        Route::post('/vault-to-vault', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->defaults('transferType', 'VAULT_TO_VAULT')
            ->middleware('permission:cash_transfers.create')
            ->name('vault-to-vault.store');
        Route::get('/bank-to-vault', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->defaults('transferType', 'BANK_TO_VAULT')
            ->middleware('permission:cash_transfers.create')
            ->name('bank-to-vault');
        Route::post('/bank-to-vault', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->defaults('transferType', 'BANK_TO_VAULT')
            ->middleware('permission:cash_transfers.create')
            ->name('bank-to-vault.store');
        Route::get('/vault-to-bank', [CashMovementController::class, 'tellerToTellerTransfer'])
            ->defaults('transferType', 'VAULT_TO_BANK')
            ->middleware('permission:cash_transfers.create')
            ->name('vault-to-bank');
        Route::post('/vault-to-bank', [CashMovementController::class, 'storeTellerToTellerTransfer'])
            ->defaults('transferType', 'VAULT_TO_BANK')
            ->middleware('permission:cash_transfers.create')
            ->name('vault-to-bank.store');

        Route::get('/vault-transfers', [CashMovementController::class, 'cashTransfers'])
            ->middleware('permission:cash_transfers.view')
            ->name('vault-transfers.index');
        Route::post('/vault-transfers/{transfer}/approve', [CashMovementController::class, 'approveCashTransfer'])
            ->middleware('permission:cash_transfers.approve')
            ->name('vault-transfers.approve');
        Route::post('/vault-transfers/{transfer}/complete', [CashMovementController::class, 'completeCashTransfer'])
            ->middleware('permission:cash_transfers.complete')
            ->name('vault-transfers.complete');
    });

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::get('/vault-transfers', [CashMovementController::class, 'cashTransfers'])
        ->middleware('permission:cash_transfers.view')
        ->name('vault-transfers.root.index');
    Route::get('/vault-adjustments', [CashMovementController::class, 'cashAdjustments'])
        ->middleware('permission:cash_transactions.view')
        ->name('vault-adjustments.root.index');
    Route::get('/vault-adjustments/create', [CashMovementController::class, 'tellerCashAdjustment'])
        ->middleware('permission:cash_transactions.create')
        ->name('vault-adjustments.root.create');
});

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('cheque-payments')
    ->name('cheque-payments.')
    ->group(function () {
        Route::get('/', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'index'])
            ->middleware('permission:cheque_payments.view')
            ->name('index');
        Route::get('/{chequePayment}', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'show'])
            ->middleware('permission:cheque_payments.view')
            ->name('show');
        Route::post('/', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'receive'])
            ->middleware('permission:cheque_payments.receive')
            ->name('receive');
        Route::post('/{chequePayment}/verify', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'verify'])
            ->middleware('permission:cheque_payments.verify')
            ->name('verify');
        Route::post('/{chequePayment}/approve', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'approve'])
            ->middleware('permission:cheque_payments.approve')
            ->name('approve');
        Route::post('/{chequePayment}/return', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'returnPayment'])
            ->middleware('permission:cheque_payments.approve')
            ->name('return');
        Route::post('/{chequePayment}/pay', [\App\TreasuryAndCash\Controllers\ChequePaymentController::class, 'pay'])
            ->middleware('permission:cheque_payments.post')
            ->name('pay');
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
        Route::get('/petty-cash-accounts/{fund}', [PettyCashController::class, 'show'])
            ->middleware('permission:petty_cash.view')
            ->name('petty-cash-accounts.show');
        Route::get('/petty-cash-accounts/{fund}/edit', [PettyCashController::class, 'edit'])
            ->middleware('permission:petty_cash.update')
            ->name('petty-cash-accounts.edit');
        Route::put('/petty-cash-accounts/{fund}', [PettyCashController::class, 'update'])
            ->middleware('permission:petty_cash.update')
            ->name('petty-cash-accounts.update');
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
        Route::get('/bank-accounts', [BankingController::class, 'accounts'])
            ->middleware('permission:bank_accounts.view')
            ->name('bank-accounts.index');
        Route::get('/bank-accounts/create', [BankingController::class, 'createAccount'])
            ->middleware('permission:bank_accounts.create')
            ->name('bank-accounts.create');
        Route::post('/bank-accounts', [BankingController::class, 'storeAccount'])
            ->middleware('permission:bank_accounts.create')
            ->name('bank-accounts.store');
        Route::get('/bank-accounts/{account}', [BankingController::class, 'showAccount'])
            ->middleware('permission:bank_accounts.view')
            ->name('bank-accounts.show');
        Route::get('/bank-accounts/{account}/edit', [BankingController::class, 'editAccount'])
            ->middleware('permission:bank_accounts.update')
            ->name('bank-accounts.edit');
        Route::put('/bank-accounts/{account}', [BankingController::class, 'updateAccount'])
            ->middleware('permission:bank_accounts.update')
            ->name('bank-accounts.update');
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
