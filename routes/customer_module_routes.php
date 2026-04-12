<?php

use App\CustomerModule\Controllers\CustomerAddressController;
use App\CustomerModule\Controllers\CustomerController;
use App\CustomerModule\Controllers\CustomerFamilyRelationController;
use App\CustomerModule\Controllers\CustomerIntroducerController;
use App\CustomerModule\Controllers\KycDocumentController;
use Illuminate\Support\Facades\Route;



Route::middleware(['auth', 'verified'])->prefix('addresses')->name('addresses.')->group(function () {
    Route::get('/create/{customer}', [CustomerAddressController::class, 'create'])->name('create');
    Route::post('/', [CustomerAddressController::class, 'store'])->name('store');

    Route::get('/{address}', [CustomerAddressController::class, 'show'])->name('show');
    Route::get('/{address}/edit', [CustomerAddressController::class, 'edit'])->name('edit');
    Route::put('/{address}', [CustomerAddressController::class, 'update'])->name('update');
    Route::delete('/{address}', [CustomerAddressController::class, 'destroy'])->name('destroy');
});

Route::middleware(['auth', 'verified'])->prefix('family-relations')->name('family-relations.')->group(function () {
    Route::get('/', [CustomerFamilyRelationController::class, 'index'])->name('index');
    Route::get('/create/{customer}', [CustomerFamilyRelationController::class, 'create'])->name('create');
    Route::post('/', [CustomerFamilyRelationController::class, 'store'])->name('store');

    Route::get('/{familyRelation}', [CustomerFamilyRelationController::class, 'show'])->name('show');
    Route::get('/{familyRelation}/edit', [CustomerFamilyRelationController::class, 'edit'])->name('edit');
    Route::put('/{familyRelation}', [CustomerFamilyRelationController::class, 'update'])->name('update');
    Route::delete('/{familyRelation}', [CustomerFamilyRelationController::class, 'destroy'])->name('destroy');

    Route::post('/family-relations/{familyRelation}/approve', [CustomerFamilyRelationController::class, 'approve'])->name('approve');
    Route::post('/family-relations/{familyRelation}/reject', [CustomerFamilyRelationController::class, 'reject'])->name('reject');
});

Route::middleware(['auth', 'verified'])->prefix('introducers')->name('introducers.')->group(function () {
    Route::get('/', [CustomerIntroducerController::class, 'index'])->name('index');
    Route::get('/create/{customer}', [CustomerIntroducerController::class, 'create'])->name('create');
    Route::post('/', [CustomerIntroducerController::class, 'store'])->name('store');

    Route::get('/{introducer}', [CustomerIntroducerController::class, 'show'])->name('show');
    Route::get('/{introducer}/edit', [CustomerIntroducerController::class, 'edit'])->name('edit');
    Route::put('/{introducer}', [CustomerIntroducerController::class, 'update'])->name('update');
    Route::delete('/{introducer}', [CustomerIntroducerController::class, 'destroy'])->name('destroy');

    // ✅ KYC verification lifecycle
    Route::post('/{introducer}/approve', [CustomerIntroducerController::class, 'approve'])->name('approve');
    Route::post('/{introducer}/reject', [CustomerIntroducerController::class, 'reject'])->name('reject');
});

Route::middleware(['auth', 'verified'])->prefix('kyc-documents')->name('kyc-documents.')->group(function () {
    Route::get('/', [KycDocumentController::class, 'index'])->name('index');
    Route::get('/create/{customer}', [KycDocumentController::class, 'create'])->name('create');
    Route::post('/', [KycDocumentController::class, 'store'])->name('store');

    Route::get('/{kycDocument}', [KycDocumentController::class, 'show'])->name('show');
    Route::get('/{kycDocument}/edit', [KycDocumentController::class, 'edit'])->name('edit');
    Route::put('/{kycDocument}', [KycDocumentController::class, 'update'])->name('update');
    Route::delete('/{kycDocument}', [KycDocumentController::class, 'destroy'])->name('destroy');

    // ✅ Verification lifecycle
    Route::post('/{kycDocument}/approve', [KycDocumentController::class, 'approve'])->name('approve');
    Route::post('/{kycDocument}/reject', [KycDocumentController::class, 'reject'])->name('reject');
});

Route::middleware(['auth', 'verified'])->prefix('customers')->name('customers.')->group(function () {
    Route::get('/', [CustomerController::class, 'index'])->name('index');
    Route::get('/create', [CustomerController::class, 'create'])->name('create');
    Route::post('/', [CustomerController::class, 'store'])->name('store');
    Route::get('/{customer}', [CustomerController::class, 'show'])->name('show');
    Route::get('/{customer}/edit', [CustomerController::class, 'edit'])->name('edit');
    Route::put('/{customer}', [CustomerController::class, 'update'])->name('update');
    Route::delete('/{customer}', [CustomerController::class, 'destroy'])->name('destroy');
    Route::get('/api/search', [CustomerController::class, 'search'])->name('search');
});

