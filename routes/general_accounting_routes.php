<?php

use App\GeneralAccounting\Controllers\AccountGroupController;
use App\GeneralAccounting\Controllers\AccountingReportController;
use App\GeneralAccounting\Controllers\FiscalPeriodController;
use App\GeneralAccounting\Controllers\FiscalYearController;
use App\GeneralAccounting\Controllers\LedgerAccountController;
use App\GeneralAccounting\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;

// Fiscal Years
Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::resource('fiscal-years', FiscalYearController::class)
        ->except(['show'])
        ->names([
            'index' => 'fiscal-years.index',
            'create' => 'fiscal-years.create',
            'store' => 'fiscal-years.store',
            'edit' => 'fiscal-years.edit',
            'update' => 'fiscal-years.update',
            'destroy' => 'fiscal-years.destroy',
        ]);

    Route::post('/fiscal-years/{fiscal_year}/close-year', [FiscalYearController::class, 'closeYear'])
        ->name('fiscal-years.close-year');

    // Fiscal Periods
    Route::resource('fiscal-periods', FiscalPeriodController::class)
        ->except(['show'])
        ->names([
            'index' => 'fiscal-periods.index',
            'create' => 'fiscal-periods.create',
            'store' => 'fiscal-periods.store',
            'edit' => 'fiscal-periods.edit',
            'update' => 'fiscal-periods.update',
            'destroy' => 'fiscal-periods.destroy',
        ]);

    Route::post('/fiscal-periods/{fiscal_period}/close', [FiscalPeriodController::class, 'close'])
        ->name('fiscal-periods.close');
    Route::post('/fiscal-periods/{fiscal_period}/reopen', [FiscalPeriodController::class, 'reopen'])
        ->name('fiscal-periods.reopen');
});

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::resource('account-groups', AccountGroupController::class)
        ->except(['show'])
        ->names([
            'index' => 'account-groups.index',
            'create' => 'account-groups.create',
            'store' => 'account-groups.store',
            'edit' => 'account-groups.edit',
            'update' => 'account-groups.update',
            'destroy' => 'account-groups.destroy',
        ]);

    Route::resource('ledger-accounts', LedgerAccountController::class)
        ->middleware('permission:accounting.coa.view');

    Route::get('/api/search-ledger', [LedgerAccountController::class, 'ledgerSearch'])
        ->name('ledger-accounts.search');

    Route::get('/vouchers', [VoucherController::class, 'index'])->name('vouchers.index');
    Route::get('/vouchers/create', [VoucherController::class, 'create'])->name('vouchers.create');
    Route::post('/vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
    Route::get('/vouchers/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
    Route::get('/vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
    Route::put('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
    Route::post('/vouchers/{voucher}/post', [VoucherController::class, 'post'])->name('vouchers.post');
    Route::post('/vouchers/{voucher}/cancel', [VoucherController::class, 'cancel'])->name('vouchers.cancel');
    Route::post('/vouchers/{voucher}/reverse', [VoucherController::class, 'reverse'])->name('vouchers.reverse');

    Route::get('/trial-balance', [AccountingReportController::class, 'trialBalance'])
        ->name('financial-reports.trial-balance');
    Route::get('/financial-reports/general-ledger', [AccountingReportController::class, 'generalLedger'])
        ->name('financial-reports.general-ledger');
    Route::get('/financial-reports/profit-loss', [AccountingReportController::class, 'profitAndLoss'])
        ->name('financial-reports.profit-loss');
    Route::get('/financial-reports/balance-sheet', [AccountingReportController::class, 'balanceSheet'])
        ->name('financial-reports.balance-sheet');
    Route::get('/financial-reports/cash-flow', [AccountingReportController::class, 'cashFlow'])
        ->name('financial-reports.cash-flow');
    Route::get('/financial-reports/shareholders-equity', [AccountingReportController::class, 'shareholdersEquity'])
        ->name('financial-reports.shareholders-equity');

    Route::get('/opening-balances', [\App\GeneralAccounting\Controllers\OpeningBalanceController::class, 'index'])
        ->name('opening-balances.index');
    Route::get('/opening-balances/create', [\App\GeneralAccounting\Controllers\OpeningBalanceController::class, 'create'])
        ->name('opening-balances.create');
    Route::post('/opening-balances', [\App\GeneralAccounting\Controllers\OpeningBalanceController::class, 'store'])
        ->name('opening-balances.store');
});




