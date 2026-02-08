<?php

use App\Accounting\GlAccount\Controllers\GlAccountController;
use App\Accounting\Voucher\Controllers\JournalEntryController;
use App\Branch\Controllers\BranchController;
use App\CostomerMgmt\Controllers\CustomerAddressController;
use App\CostomerMgmt\Controllers\CustomerController;
use App\CostomerMgmt\Controllers\CustomerFamilyRelationController;
use App\CostomerMgmt\Controllers\CustomerSignatureController;
use App\CostomerMgmt\Controllers\OnlineServiceUserController;
use App\Http\Controllers\DashboardController;
use App\Media\Controllers\MediaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    return Inertia::render('auth/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'canRegister' => Features::enabled(Features::registration()),
        'status' => $request->session()->get('status'),
    ]);
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

require __DIR__ . '/settings.php';

Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('media', MediaController::class);
        Route::get('/api/media', [MediaController::class, 'getMedia'])->name('get-media');
        Route::resource('branches', BranchController::class);
        Route::resource('customers', CustomerController::class);
        Route::get('/api/search-customers', [CustomerController::class, 'searchCustomers'])->name('search-customers');
        Route::get('/api/customer-addresses', [CustomerAddressController::class, 'getCustomerAddresses'])->name('customer-addresses');
        Route::resource('addresses', CustomerAddressController::class);
        Route::resource('family-relations', CustomerFamilyRelationController::class);
        Route::get(
            '/customer/signatures',
            [CustomerSignatureController::class, 'index']
        )->name('signatures.index');
        Route::get(
            '/api/customer/signature',
            [CustomerSignatureController::class, 'getCustomerSignature']
        )->name('customer.signature.show');

        // Store new signature
        Route::post(
            '/api/customer/signature',
            [CustomerSignatureController::class, 'store']
        )->name('customer.signature.store');

        // Update signature
        Route::put(
            '/api/customer/signature/{signature}',
            [CustomerSignatureController::class, 'update']
        )->name('customer.signature.update');

        // Delete signature
        Route::delete(
            '/api/customer/signature/{signature}',
            [CustomerSignatureController::class, 'destroy']
        )->name('customer.signature.destroy');

        Route::resource('online-clients', OnlineServiceUserController::class);

    });

Route::prefix('auth')->middleware(['auth',])->group(function () {
    Route::get('/gl_accounts', [GlAccountController::class, 'index'])->name('gl-accounts.index');
    Route::get('/api/search-ledger', [GlAccountController::class, 'ledgerSearch'])->name('gl-accounts.search');

    Route::post('/gl_accounts', [GlAccountController::class, 'store'])->name('gl-accounts.store');
    Route::put('/gl_accounts/{gl_account}', [GlAccountController::class, 'update'])->name('gl-accounts.update');
    Route::delete('/gl_accounts/{gl_account}', [GlAccountController::class, 'destroy'])->name('gl-accounts.destroy');
    Route::post('/gl_accounts/move', [GlAccountController::class, 'move'])->name('gl-accounts.move');
});

Route::prefix('auth')->middleware(['auth',])->group(function () {
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