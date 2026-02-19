<?php

use App\Accounting\Controllers\AccountController;
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
    Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::get('/api/search-ledger', [AccountController::class, 'ledgerSearch'])->name('accounts.search');

    Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::put('/accounts/{gl_account}', [AccountController::class, 'update'])->name('accounts.update');
    Route::delete('/accounts/{gl_account}', [AccountController::class, 'destroy'])->name('accounts.destroy');
    Route::post('/accounts/move', [AccountController::class, 'move'])->name('accounts.move');
});

Route::middleware(['auth',])->group(function () {
    // Voucher listing
    Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');

    // Voucher create routes per type
    Route::get('debit-voucher/create', [VoucherController::class, 'createDebitVoucher'])->name('vouchers.create.debit');
    Route::get('credit-voucher/create', [VoucherController::class, 'createCreditVoucher'])->name('vouchers.create.credit');
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