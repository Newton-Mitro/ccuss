<?php

use App\CostomerMgmt\Controllers\CustomerAddressController;
use App\CostomerMgmt\Controllers\CustomerController;
use App\CostomerMgmt\Controllers\CustomerFamilyRelationController;
use App\CostomerMgmt\Controllers\CustomerIntroducerController;
use App\CostomerMgmt\Controllers\CustomerSignatureController;
use App\CostomerMgmt\Controllers\OnlineServiceUserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('customers', CustomerController::class);
        Route::get('/api/search-customers', [CustomerController::class, 'searchCustomers'])->name('search-customers');
        Route::get('/api/find-customers/{search}', [CustomerController::class, 'findCustomer'])->name('find-customer');
    });

Route::middleware(['auth', 'verified'])
    ->group(function () {
        // 📄 Inertia pages
        Route::get('/addresses', [CustomerAddressController::class, 'index'])
            ->name('customer.addresses.index');

        Route::get('/addresses/customer', [CustomerAddressController::class, 'customerAddresses'])
            ->name('customer.addresses.customer');

        Route::get('/addresses/{address}', [CustomerAddressController::class, 'show'])
            ->name('customer.addresses.show');

        // 🔄 AJAX / API endpoints
        Route::get('/api/addresses/addresses-by-customer', [CustomerAddressController::class, 'getCustomerAddresses'])
            ->name('customer.addresses.by-customer');

        Route::post('/addresses', [CustomerAddressController::class, 'store'])
            ->name('customer.addresses.store');

        Route::put('/addresses/{address}', [CustomerAddressController::class, 'update'])
            ->name('customer.addresses.update');

        Route::delete('/addresses/{address}', [CustomerAddressController::class, 'destroy'])
            ->name('customer.addresses.destroy');
    });


Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('family-relations', CustomerFamilyRelationController::class);
    });

Route::middleware(['auth', 'verified'])
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

Route::middleware(['auth'])->group(function () {
    Route::get(
        '/introducers',
        [CustomerIntroducerController::class, 'index']
    )->name('customers.introducers.index');

    Route::post(
        '/introducers',
        [CustomerIntroducerController::class, 'store']
    )->name('customers.introducers.store');

    Route::put(
        '/introducers/{customerIntroducer}',
        [CustomerIntroducerController::class, 'update']
    )->name('customers.introducers.update');

    Route::post(
        '/introducers/{customerIntroducer}/verify',
        [CustomerIntroducerController::class, 'verify']
    )->name('customers.introducers.verify');

    Route::delete(
        '/introducers/{customerIntroducer}',
        [CustomerIntroducerController::class, 'destroy']
    )->name('customers.introducers.destroy');
});


Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('/online-service-users', OnlineServiceUserController::class);
    });