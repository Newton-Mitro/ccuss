<?php

use App\Accounting\Controllers\AccountingReportController;
use App\Accounting\Controllers\LedgerAccountController;
use App\Accounting\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;

use App\Accounting\Controllers\FiscalYearController;
use App\Accounting\Controllers\FiscalPeriodController;

// Fiscal Years
Route::middleware(['auth',])->group(function () {
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


Route::middleware(['auth',])->group(function () {
    Route::get('/ledger_accounts', [LedgerAccountController::class, 'index'])->name('ledger_accounts.index');
    Route::get('/api/search-ledger', [LedgerAccountController::class, 'ledgerSearch'])->name('ledger_accounts.search');
    Route::get('/api/get-cash-ledgers', [LedgerAccountController::class, 'cashLedgerList'])->name('ledger_accounts.cash-ledger-list');

    Route::post('/ledger_accounts', [LedgerAccountController::class, 'store'])->name('ledger_accounts.store');
    Route::put('/ledger_accounts/{gl_account}', [LedgerAccountController::class, 'update'])->name('ledger_accounts.update');
    Route::delete('/ledger_accounts/{gl_account}', [LedgerAccountController::class, 'destroy'])->name('ledger_accounts.destroy');
});

Route::middleware(['auth',])->group(function () {
    // Voucher listing
    Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');

    // Voucher create routes per type
    Route::get('vouchers/debit/create', [VoucherController::class, 'createDebitVoucher'])->name('vouchers.create');
    Route::get('vouchers/credit/create', [VoucherController::class, 'createCreditVoucher'])->name('vouchers.create.credit');
    Route::get('vouchers/journal/create', [VoucherController::class, 'createJournalVoucher'])->name('vouchers.create.journal');
    Route::get('vouchers/contra/create', [VoucherController::class, 'createContraVoucher'])->name('vouchers.create.contra');
    // Transfer can reuse store with type 'transfer' in request

    // Store voucher (handles all types dynamically)
    Route::post('vouchers', [VoucherController::class, 'store'])->name('vouchers.store');

    // Show, edit, update, destroy resource routes
    Route::get('vouchers/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
    Route::get('vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
    Route::put('vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
    Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');
});


Route::middleware(['auth',])->group(function () {
    Route::get('/reports/trial-balance', [AccountingReportController::class, 'trialBalance'])->name('reports.trial-balance');
    Route::get('/reports/profit-loss', [AccountingReportController::class, 'profitAndLoss'])->name('reports.profit-loss');
    Route::get('/reports/balance-sheet', [AccountingReportController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('/reports/cash-flow', [AccountingReportController::class, 'cashFlow'])->name('reports.cash-flow');
    Route::get('/reports/shareholders-equity', [AccountingReportController::class, 'shareholdersEquity'])->name('reports.shareholders-equity');
});