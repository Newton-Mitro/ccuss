<?php

use App\GeneralAccounting\Controllers\AccountGroupController;
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
    Route::post('/vouchers/{voucher}/post', [VoucherController::class, 'post'])->name('vouchers.post');
});




