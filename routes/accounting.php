<?php

use App\Accounting\GlAccount\Controllers\GlAccountController;
use App\Accounting\Voucher\Controllers\JournalEntryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth',])->group(function () {
    Route::get('/gl_accounts', [GlAccountController::class, 'index'])->name('gl-accounts.index');
    Route::get('/api/search-ledger', [GlAccountController::class, 'ledgerSearch'])->name('gl-accounts.search');

    Route::post('/gl_accounts', [GlAccountController::class, 'store'])->name('gl-accounts.store');
    Route::put('/gl_accounts/{gl_account}', [GlAccountController::class, 'update'])->name('gl-accounts.update');
    Route::delete('/gl_accounts/{gl_account}', [GlAccountController::class, 'destroy'])->name('gl-accounts.destroy');
    Route::post('/gl_accounts/move', [GlAccountController::class, 'move'])->name('gl-accounts.move');
});

Route::middleware(['auth',])->group(function () {
    // Voucher listing
    Route::get('vouchers/list', [JournalEntryController::class, 'index'])->name('vouchers.index');

    // Voucher create routes per type
    Route::get('vouchers/debit/create', [JournalEntryController::class, 'createDebitVoucher'])->name('vouchers.create.debit');
    Route::get('vouchers/credit/create', [JournalEntryController::class, 'createCreditVoucher'])->name('vouchers.create.credit');
    Route::get('vouchers/journal/create', [JournalEntryController::class, 'createJournalVoucher'])->name('vouchers.create.journal');
    Route::get('vouchers/contra/create', [JournalEntryController::class, 'createContraVoucher'])->name('vouchers.create.contra');
    // Transfer can reuse store with type 'transfer' in request

    // Store voucher (handles all types dynamically)
    Route::post('vouchers', [JournalEntryController::class, 'store'])->name('vouchers.store');

    // Show, edit, update, destroy resource routes
    Route::get('vouchers/{voucher}', [JournalEntryController::class, 'show'])->name('vouchers.show');
    Route::get('vouchers/{voucher}/edit', [JournalEntryController::class, 'edit'])->name('vouchers.edit');
    Route::put('vouchers/{voucher}', [JournalEntryController::class, 'update'])->name('vouchers.update');
    Route::delete('vouchers/{voucher}', [JournalEntryController::class, 'destroy'])->name('vouchers.destroy');
});