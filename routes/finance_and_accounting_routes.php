<?php

use App\FinanceAndAccounting\Controllers\AccountingReportController;
use App\FinanceAndAccounting\Controllers\FiscalPeriodController;
use App\FinanceAndAccounting\Controllers\LedgerAccountController;
use Illuminate\Support\Facades\Route;
use App\FinanceAndAccounting\Controllers\FiscalYearController;

// Fiscal Years
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('fiscal-years', FiscalYearController::class)
        ->names([
            'index' => 'fiscal-years.index',
            'create' => 'fiscal-years.create',
            'store' => 'fiscal-years.store',
            'edit' => 'fiscal-years.edit',
            'update' => 'fiscal-years.update',
            'destroy' => 'fiscal-years.destroy',
        ]);

    // Fiscal Periods
    Route::resource('fiscal-periods', FiscalPeriodController::class)
        ->names([
            'index' => 'fiscal-periods.index',
            'create' => 'fiscal-periods.create',
            'store' => 'fiscal-periods.store',
            'edit' => 'fiscal-periods.edit',
            'update' => 'fiscal-periods.update',
            'destroy' => 'fiscal-periods.destroy',
        ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/api/search-ledger', [LedgerAccountController::class, 'ledgerSearch'])->name('ledger_accounts.search');
    Route::get('/api/get-cash-ledgers', [LedgerAccountController::class, 'cashLedgerList'])->name('ledger_accounts.cash-ledger-list');
});


Route::prefix('accounting')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/chart-of-accounts', [LedgerAccountController::class, 'index'])->name('ledger_accounts.index');
    Route::post('/ledger_accounts', [LedgerAccountController::class, 'store'])->name('ledger_accounts.store');
    Route::put('/ledger_accounts/{gl_account}', [LedgerAccountController::class, 'update'])->name('ledger_accounts.update');
    Route::delete('/ledger_accounts/{gl_account}', [LedgerAccountController::class, 'destroy'])->name('ledger_accounts.destroy');

    Route::get('/trial-balance', [AccountingReportController::class, 'trialBalance'])->name('reports.trial-balance');
    Route::get('/financial-reports/profit-loss', [AccountingReportController::class, 'profitAndLoss'])->name('reports.profit-loss');
    Route::get('/financial-reports/balance-sheet', [AccountingReportController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('/financial-reports/cash-flow', [AccountingReportController::class, 'cashFlow'])->name('reports.cash-flow');
    Route::get('/financial-reports/shareholders-equity', [AccountingReportController::class, 'shareholdersEquity'])->name('reports.shareholders-equity');
});


