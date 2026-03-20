<?php

use App\CustomerModule\Controllers\CustomerAddressController;
use App\CustomerModule\Controllers\CustomerController;
use App\CustomerModule\Controllers\CustomerFamilyRelationController;
use App\CustomerModule\Controllers\CustomerIntroducerController;
use App\CustomerModule\Controllers\KycDocumentController;
use App\CustomerModule\Controllers\KycProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('customers', CustomerController::class);
        Route::get('/api/search-customers', [CustomerController::class, 'searchCustomers'])->name('search-customers');
        Route::get('/api/find-customers/{search}', [CustomerController::class, 'findCustomer'])->name('find-customer');

        Route::resource('addresses', CustomerAddressController::class);
        Route::resource('family-relations', CustomerFamilyRelationController::class);
        Route::resource('introducers', CustomerIntroducerController::class);
        Route::resource('kyc-documents', KycDocumentController::class);
        Route::resource('kyc-profiles', KycProfileController::class);
    });

