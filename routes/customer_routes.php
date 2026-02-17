<?php

use App\CostomerMgmt\Controllers\CustomerAddressController;
use App\CostomerMgmt\Controllers\CustomerController;
use App\CostomerMgmt\Controllers\CustomerFamilyRelationController;
use App\CostomerMgmt\Controllers\CustomerIntroducerController;
use App\CostomerMgmt\Controllers\CustomerSignatureController;
use App\CostomerMgmt\Controllers\OnlineServiceClientController;
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

        // 📄 Inertia pages
        Route::get('/family-relations', [CustomerFamilyRelationController::class, 'index'])
            ->name('family-relations.index');

        Route::get('/family-relations/customer', [CustomerFamilyRelationController::class, 'customerRelations'])
            ->name('family-relations.customer');

        Route::get('/family-relations/{familyRelation}', [CustomerFamilyRelationController::class, 'show'])
            ->name('family-relations.show');

        // 🔄 AJAX / API endpoints
        Route::get(
            '/api/family-relations/by-customer',
            [CustomerFamilyRelationController::class, 'getCustomerRelations']
        )->name('family-relations.by-customer');

        Route::post('/family-relations', [CustomerFamilyRelationController::class, 'store'])
            ->name('family-relations.store');

        Route::put('/family-relations/{familyRelation}', [CustomerFamilyRelationController::class, 'update'])
            ->name('family-relations.update');

        Route::delete('/family-relations/{familyRelation}', [CustomerFamilyRelationController::class, 'destroy'])
            ->name('family-relations.destroy');
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

Route::middleware(['auth', 'verified'])->group(function () {

    // 📄 Inertia pages
    Route::get('/introducers', [CustomerIntroducerController::class, 'index'])
        ->name('introducers.index');

    Route::get('/introducers/customer', [CustomerIntroducerController::class, 'customerIntroducers'])
        ->name('introducers.customer');

    Route::get('/introducers/{customerIntroducer}', [CustomerIntroducerController::class, 'show'])
        ->name('introducers.show');

    // 🔄 AJAX / API endpoints
    Route::get(
        '/api/introducers/by-customer',
        [CustomerIntroducerController::class, 'getCustomerIntroducers']
    )->name('introducers.by-customer');

    Route::post('/introducers', [CustomerIntroducerController::class, 'store'])
        ->name('introducers.store');

    Route::put('/introducers/{customerIntroducer}', [CustomerIntroducerController::class, 'update'])
        ->name('introducers.update');

    Route::put('/introducers/{customerIntroducer}/verify', [CustomerIntroducerController::class, 'verify'])
        ->name('introducers.verify');

    Route::delete('/introducers/{customerIntroducer}', [CustomerIntroducerController::class, 'destroy'])
        ->name('introducers.destroy');
});


Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('/online-service-clients', OnlineServiceClientController::class);
    });