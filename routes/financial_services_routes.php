<?php

use App\FinancialServices\Controllers\FinancialProductController;
use App\FinancialServices\Controllers\FinancialAccountController;
use App\FinancialServices\Controllers\FinancialTransactionController;
use App\FinancialServices\Controllers\FinancialProductPolicyController;
use App\FinancialServices\Controllers\FinancialReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::resource('financial-products', FinancialProductController::class)
        ->except(['create', 'show'])
        ->names([
            'index' => 'financial-products.index',
            'store' => 'financial-products.store',
            'edit' => 'financial-products.edit',
            'update' => 'financial-products.update',
            'destroy' => 'financial-products.destroy',
        ]);

    Route::get('/financial-products/create', [FinancialProductController::class, 'create'])
        ->name('financial-products.create');
    Route::get('/financial-products/{financial_product}', [FinancialProductController::class, 'show'])
        ->name('financial-products.show');
    Route::post('/financial-products/{financial_product}/account-mappings', [FinancialProductController::class, 'storeMapping'])
        ->name('financial-products.account-mappings.store');
    Route::put('/financial-products/{financial_product}/account-mappings/{mapping}', [FinancialProductController::class, 'updateMapping'])
        ->name('financial-products.account-mappings.update');
    Route::delete('/financial-products/{financial_product}/account-mappings/{mapping}', [FinancialProductController::class, 'destroyMapping'])
        ->name('financial-products.account-mappings.destroy');
    Route::get('/financial-product-policies', [FinancialProductPolicyController::class, 'index'])
        ->name('financial-product-policies.index');
    Route::get('/financial-products/{financial_product}/policy/edit', [FinancialProductPolicyController::class, 'edit'])
        ->name('financial-product-policies.edit');
    Route::post('/financial-products/{financial_product}/policy', [FinancialProductPolicyController::class, 'store'])
        ->name('financial-product-policies.store');

    Route::get('/financial-accounts', [FinancialAccountController::class, 'index'])->name('financial-accounts.index');
    Route::get('/financial-accounts/category/{category}', [FinancialAccountController::class, 'categoryIndex'])
        ->where('category', 'SAVINGS|SHARE|FIXED_DEPOSIT|RECURRING_DEPOSIT|LOAN')
        ->name('financial-accounts.category');
    Route::get('/financial-accounts/create', [FinancialAccountController::class, 'create'])->name('financial-accounts.create');
    Route::post('/financial-accounts', [FinancialAccountController::class, 'store'])->name('financial-accounts.store');
    Route::get('/financial-accounts/{financial_account}', [FinancialAccountController::class, 'show'])->name('financial-accounts.show');
    Route::post('/financial-accounts/{financial_account}/activate', [FinancialAccountController::class, 'activate'])->name('financial-accounts.activate');
    Route::post('/financial-accounts/{financial_account}/close', [FinancialAccountController::class, 'close'])->name('financial-accounts.close');
    Route::post('/financial-accounts/{financial_account}/nominees', [FinancialAccountController::class, 'storeNominee'])->name('financial-accounts.nominees.store');
    Route::put('/financial-accounts/{financial_account}/nominees/{nominee}', [FinancialAccountController::class, 'updateNominee'])->name('financial-accounts.nominees.update');
    Route::delete('/financial-accounts/{financial_account}/nominees/{nominee}', [FinancialAccountController::class, 'destroyNominee'])->name('financial-accounts.nominees.destroy');
    Route::post('/financial-accounts/{financial_account}/holders', [FinancialAccountController::class, 'storeHolder'])->name('financial-accounts.holders.store');
    Route::put('/financial-accounts/{financial_account}/holders/{holder}', [FinancialAccountController::class, 'updateHolder'])->name('financial-accounts.holders.update');
    Route::delete('/financial-accounts/{financial_account}/holders/{holder}', [FinancialAccountController::class, 'destroyHolder'])->name('financial-accounts.holders.destroy');
    Route::post('/financial-accounts/{financial_account}/membership', [FinancialAccountController::class, 'storeShareAccount'])->name('financial-accounts.membership.store');
    Route::put('/financial-accounts/{financial_account}/membership/{shareAccount}', [FinancialAccountController::class, 'updateShareAccount'])->name('financial-accounts.membership.update');
    Route::post('/financial-accounts/{financial_account}/fixed-deposit', [FinancialAccountController::class, 'storeFixedDeposit'])->name('financial-accounts.fixed-deposit.store');
    Route::post('/financial-accounts/{financial_account}/recurring-deposit', [FinancialAccountController::class, 'storeRecurringDeposit'])->name('financial-accounts.recurring-deposit.store');
    Route::get('/financial-account-statements', [FinancialAccountController::class, 'statement'])->name('financial-account-statements.index');

    Route::get('/financial-transactions', [FinancialTransactionController::class, 'index'])->name('financial-transactions.index');
    Route::get('/financial-transactions/{workflow}/create', [FinancialTransactionController::class, 'workflow'])
        ->where('workflow', 'transfer|loan-disbursement|loan-repayment')
        ->name('financial-transactions.workflow');
    Route::post('/financial-transactions/transfer', [FinancialTransactionController::class, 'storeTransfer'])
        ->name('financial-transactions.transfer.store');
    Route::post('/financial-transactions/loan-disbursement', [FinancialTransactionController::class, 'storeLoanDisbursement'])
        ->name('financial-transactions.loan-disbursement.store');
    Route::post('/financial-transactions', [FinancialTransactionController::class, 'store'])->name('financial-transactions.store');
    Route::get('/financial-transactions/{financial_transaction}', [FinancialTransactionController::class, 'show'])->name('financial-transactions.show');
    Route::post('/financial-transactions/{financial_transaction}/post', [FinancialTransactionController::class, 'post'])->name('financial-transactions.post');
    Route::post('/financial-transactions/{financial_transaction}/reverse', [FinancialTransactionController::class, 'reverse'])->name('financial-transactions.reverse');

    Route::get('/financial-services', [FinancialReportController::class, 'dashboard'])->name('financial-services.dashboard');
    Route::get('/financial-reports/product-summary', [FinancialReportController::class, 'productSummary'])->name('financial-reports.product-summary');
    Route::get('/financial-reports/account-balances', [FinancialReportController::class, 'accountBalances'])->name('financial-reports.account-balances');
    Route::get('/financial-reports/transactions', [FinancialReportController::class, 'transactions'])->name('financial-reports.transactions');

});