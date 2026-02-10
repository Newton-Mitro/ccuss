<?php

use App\CostomerMgmt\Controllers\CustomerAddressController;
use App\CostomerMgmt\Controllers\CustomerController;
use App\CostomerMgmt\Controllers\CustomerFamilyRelationController;
use App\CostomerMgmt\Controllers\CustomerSignatureController;
use App\CostomerMgmt\Controllers\OnlineServiceUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('customers', CustomerController::class);
        Route::get('/api/search-customers', [CustomerController::class, 'searchCustomers'])->name('search-customers');
        Route::get('/api/find-customers/{search}', [CustomerController::class, 'findCustomer'])->name('find-customer');
    });

Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('/addresses', [CustomerAddressController::class, 'index'])
            ->name('customer.addresses.index');

        // 📍 Single address view page
        Route::get('/addresses/get/{address}', [CustomerAddressController::class, 'show'])
            ->name('customer.addresses.show');

        // 📍 Customer-wise addresses page (UI shell)
        Route::get('/addresses/customer', [CustomerAddressController::class, 'customerAddresses'])
            ->name('customer.addresses.by-customer');
    });

Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('family-relations', CustomerFamilyRelationController::class);
    });

Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::get(
            '/customer/signatures',
            [CustomerSignatureController::class, 'index']
        )->name('signatures.index');
        Route::get(
            '/api/customer/signature',
            [CustomerSignatureController::class, 'getCustomerSignature']
        )->name('customer.signature.show');
        Route::post(
            '/api/customer/signature',
            [CustomerSignatureController::class, 'store']
        )->name('customer.signature.store');
        Route::delete(
            '/api/customer/signature/{signature}',
            [CustomerSignatureController::class, 'destroy']
        )->name('customer.signature.destroy');
    });


Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('online-clients', OnlineServiceUserController::class);
    });