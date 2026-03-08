<?php

use App\Accounting\Controllers\AccountingReportController;
use App\Accounting\Controllers\LedgerAccountController;
use App\Accounting\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;

use App\Accounting\Controllers\FiscalYearController;
use App\Accounting\Controllers\AccountingPeriodController;

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
    Route::resource('accounting-periods', AccountingPeriodController::class)
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
    Route::get('/api/search-ledger', [LedgerAccountController::class, 'ledgerSearch'])->name('ledger_accounts.search');
    Route::get('/api/get-cash-ledgers', [LedgerAccountController::class, 'cashLedgerList'])->name('ledger_accounts.cash-ledger-list');
});


Route::prefix('accounting')->middleware(['auth',])->group(function () {
    Route::get('/chart-of-accounts', [LedgerAccountController::class, 'index'])->name('ledger_accounts.index');
    Route::post('/ledger_accounts', [LedgerAccountController::class, 'store'])->name('ledger_accounts.store');
    Route::put('/ledger_accounts/{gl_account}', [LedgerAccountController::class, 'update'])->name('ledger_accounts.update');
    Route::delete('/ledger_accounts/{gl_account}', [LedgerAccountController::class, 'destroy'])->name('ledger_accounts.destroy');

    Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');

    // Voucher create routes per type
    Route::get('vouchers/debit-voucher/create', [VoucherController::class, 'createDebitVoucher'])->name('vouchers.create.debit');
    Route::get('vouchers/debit-voucher/{voucher}/edit', [VoucherController::class, 'editDebitVoucher'])->name('vouchers.edit.debit');
    Route::get('vouchers/credit-voucher/create', [VoucherController::class, 'createCreditVoucher'])->name('vouchers.create.credit');
    Route::get('vouchers/credit-voucher/{voucher}/edit', [VoucherController::class, 'editCreditVoucher'])->name('vouchers.edit.credit');
    Route::get('vouchers/journal', [VoucherController::class, 'createJournalVoucher'])->name('vouchers.create.journal');
    Route::get('vouchers/journal-voucher/{voucher}/edit', [VoucherController::class, 'editJournalVoucher'])->name('vouchers.edit.journal');
    Route::get('vouchers/contra-voucher/create', [VoucherController::class, 'createContraVoucher'])->name('vouchers.create.contra');
    Route::get('vouchers/contra-voucher/{voucher}/edit', [VoucherController::class, 'editContraVoucher'])->name('vouchers.edit.contra');
    // Transfer can reuse store with type 'transfer' in request

    // Store voucher (handles all types dynamically)
    Route::post('vouchers', [VoucherController::class, 'store'])->name('vouchers.store');

    // Show, edit, update, destroy resource routes
    Route::get('vouchers/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
    Route::get('vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
    Route::put('vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
    Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');


    Route::get('/trial-balance', [AccountingReportController::class, 'trialBalance'])->name('reports.trial-balance');

    Route::get('/financial-reports/profit-loss', [AccountingReportController::class, 'profitAndLoss'])->name('reports.profit-loss');
    Route::get('/financial-reports/balance-sheet', [AccountingReportController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('/financial-reports/cash-flow', [AccountingReportController::class, 'cashFlow'])->name('reports.cash-flow');
    Route::get('/financial-reports/shareholders-equity', [AccountingReportController::class, 'shareholdersEquity'])->name('reports.shareholders-equity');
});


