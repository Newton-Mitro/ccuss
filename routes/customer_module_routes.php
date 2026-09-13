<?php

use App\CustomerModule\Controllers\CustomerAddressController;
use App\CustomerModule\Controllers\CustomerController;
use App\CustomerModule\Controllers\CustomerFamilyRelationController;
use App\CustomerModule\Controllers\CustomerIntroducerController;
use App\CustomerModule\Controllers\KycDocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Approval / Management Pages
    |--------------------------------------------------------------------------
    */

    Route::get('/addresses-approval', [CustomerAddressController::class, 'index'])
        ->name('addresses.index');

    Route::get('/family-relations-approval', [CustomerFamilyRelationController::class, 'index'])
        ->name('family-relations.index');

    Route::get('/introducers-approval', [CustomerIntroducerController::class, 'index'])
        ->name('introducers.index');

    Route::get('/kyc-documents-approval', [KycDocumentController::class, 'index'])
        ->name('kyc-documents.index');
});


Route::middleware(['auth', 'verified'])
    ->prefix('customers')
    ->name('customers.')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Customers
        |--------------------------------------------------------------------------
        */

        Route::get('/', [CustomerController::class, 'index'])
            ->name('index');

        Route::get('/create', [CustomerController::class, 'create'])
            ->name('create');

        Route::post('/', [CustomerController::class, 'store'])
            ->name('store');

        Route::get('/api/search', [CustomerController::class, 'search'])
            ->name('search');

        Route::get('/{customer}', [CustomerController::class, 'show'])
            ->name('show');

        Route::get('/{customer}/edit', [CustomerController::class, 'edit'])
            ->name('edit');

        Route::put('/{customer}', [CustomerController::class, 'update'])
            ->name('update');

        Route::delete('/{customer}', [CustomerController::class, 'destroy'])
            ->name('destroy');


        /*
        |--------------------------------------------------------------------------
        | Customer Addresses
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/{customer}/addresses/create',
            [CustomerAddressController::class, 'create']
        )->name('addresses.create');

        Route::post(
            '/{customer}/addresses',
            [CustomerAddressController::class, 'store']
        )->name('addresses.store');

        Route::get(
            '/{customer}/addresses/{address}',
            [CustomerAddressController::class, 'show']
        )->name('addresses.show');

        Route::get(
            '/{customer}/addresses/{address}/edit',
            [CustomerAddressController::class, 'edit']
        )->name('addresses.edit');

        Route::put(
            '/{customer}/addresses/{address}',
            [CustomerAddressController::class, 'update']
        )->name('addresses.update');

        Route::delete(
            '/{customer}/addresses/{address}',
            [CustomerAddressController::class, 'destroy']
        )->name('addresses.destroy');


        /*
        |--------------------------------------------------------------------------
        | Family Relations
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/{customer}/family-relations',
            [CustomerFamilyRelationController::class, 'index']
        )->name('family-relations.index');

        Route::get(
            '/{customer}/family-relations/create',
            [CustomerFamilyRelationController::class, 'create']
        )->name('family-relations.create');

        Route::post(
            '/{customer}/family-relations',
            [CustomerFamilyRelationController::class, 'store']
        )->name('family-relations.store');

        Route::get(
            '/{customer}/family-relations/{familyRelation}',
            [CustomerFamilyRelationController::class, 'show']
        )->name('family-relations.show');

        Route::get(
            '/{customer}/family-relations/{familyRelation}/edit',
            [CustomerFamilyRelationController::class, 'edit']
        )->name('family-relations.edit');

        Route::put(
            '/{customer}/family-relations/{familyRelation}',
            [CustomerFamilyRelationController::class, 'update']
        )->name('family-relations.update');

        Route::delete(
            '/{customer}/family-relations/{familyRelation}',
            [CustomerFamilyRelationController::class, 'destroy']
        )->name('family-relations.destroy');

        Route::post(
            '/{customer}/family-relations/{familyRelation}/approve',
            [CustomerFamilyRelationController::class, 'approve']
        )->name('family-relations.approve');

        Route::post(
            '/{customer}/family-relations/{familyRelation}/reject',
            [CustomerFamilyRelationController::class, 'reject']
        )->name('family-relations.reject');


        /*
        |--------------------------------------------------------------------------
        | Introducers
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/{customer}/introducers',
            [CustomerIntroducerController::class, 'index']
        )->name('introducers.index');

        Route::get(
            '/{customer}/introducers/create',
            [CustomerIntroducerController::class, 'create']
        )->name('introducers.create');

        Route::post(
            '/{customer}/introducers',
            [CustomerIntroducerController::class, 'store']
        )->name('introducers.store');

        Route::get(
            '/{customer}/introducers/{introducer}',
            [CustomerIntroducerController::class, 'show']
        )->name('introducers.show');

        Route::get(
            '/{customer}/introducers/{introducer}/edit',
            [CustomerIntroducerController::class, 'edit']
        )->name('introducers.edit');

        Route::put(
            '/{customer}/introducers/{introducer}',
            [CustomerIntroducerController::class, 'update']
        )->name('introducers.update');

        Route::delete(
            '/{customer}/introducers/{introducer}',
            [CustomerIntroducerController::class, 'destroy']
        )->name('introducers.destroy');

        Route::post(
            '/{customer}/introducers/{introducer}/approve',
            [CustomerIntroducerController::class, 'approve']
        )->name('introducers.approve');

        Route::post(
            '/{customer}/introducers/{introducer}/reject',
            [CustomerIntroducerController::class, 'reject']
        )->name('introducers.reject');


        /*
        |--------------------------------------------------------------------------
        | KYC Documents
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/{customer}/kyc-documents',
            [KycDocumentController::class, 'index']
        )->name('kyc-documents.index');

        Route::get(
            '/{customer}/kyc-documents/create',
            [KycDocumentController::class, 'create']
        )->name('kyc-documents.create');

        Route::post(
            '/{customer}/kyc-documents',
            [KycDocumentController::class, 'store']
        )->name('kyc-documents.store');

        Route::get(
            '/{customer}/kyc-documents/{kycDocument}',
            [KycDocumentController::class, 'show']
        )->name('kyc-documents.show');

        Route::get(
            '/{customer}/kyc-documents/{kycDocument}/edit',
            [KycDocumentController::class, 'edit']
        )->name('kyc-documents.edit');

        Route::put(
            '/{customer}/kyc-documents/{kycDocument}',
            [KycDocumentController::class, 'update']
        )->name('kyc-documents.update');

        Route::delete(
            '/{customer}/kyc-documents/{kycDocument}',
            [KycDocumentController::class, 'destroy']
        )->name('kyc-documents.destroy');

        Route::post(
            '/{customer}/kyc-documents/{kycDocument}/approve',
            [KycDocumentController::class, 'approve']
        )->name('kyc-documents.approve');

        Route::post(
            '/{customer}/kyc-documents/{kycDocument}/reject',
            [KycDocumentController::class, 'reject']
        )->name('kyc-documents.reject');
    });