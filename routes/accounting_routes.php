<?php

use App\Accounting\Controllers\AccountController;
use App\Accounting\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;

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
    Route::get('vouchers/list', [VoucherController::class, 'index'])->name('vouchers.index');

    // Voucher create routes per type
    Route::get('vouchers/debit/create', [VoucherController::class, 'createDebitVoucher'])->name('vouchers.create.debit');
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