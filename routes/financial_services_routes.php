<?php

use App\FinancialServices\Controllers\FinancialProductController;
use App\FinancialServices\Controllers\FinancialAccountController;
use App\FinancialServices\Controllers\FinancialTransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])->group(function () {
    Route::resource('financial-products', FinancialProductController::class)
        ->except(['create', 'show'])
        ->names([
            'index' => 'financial-products.index',
            'store' => 'financial-products.store',
            'edit' => 'financial-products.edit',
            'update' => 'financial-products.update',
            'destroy' => 'financial-products.destroy',
        ]);

    Route::get('/financial-products/create', [FinancialProductController::class, 'create'])
        ->name('financial-products.create');
    Route::get('/financial-products/{financial_product}', [FinancialProductController::class, 'show'])
        ->name('financial-products.show');

    Route::get('/financial-accounts', [FinancialAccountController::class, 'index'])->name('financial-accounts.index');
    Route::get('/financial-accounts/create', [FinancialAccountController::class, 'create'])->name('financial-accounts.create');
    Route::post('/financial-accounts', [FinancialAccountController::class, 'store'])->name('financial-accounts.store');
    Route::get('/financial-accounts/{financial_account}', [FinancialAccountController::class, 'show'])->name('financial-accounts.show');
    Route::post('/financial-accounts/{financial_account}/activate', [FinancialAccountController::class, 'activate'])->name('financial-accounts.activate');
    Route::post('/financial-accounts/{financial_account}/close', [FinancialAccountController::class, 'close'])->name('financial-accounts.close');

    Route::get('/financial-transactions', [FinancialTransactionController::class, 'index'])->name('financial-transactions.index');
    Route::get('/financial-transactions/create', [FinancialTransactionController::class, 'create'])->name('financial-transactions.create');
    Route::post('/financial-transactions', [FinancialTransactionController::class, 'store'])->name('financial-transactions.store');
    Route::get('/financial-transactions/{financial_transaction}', [FinancialTransactionController::class, 'show'])->name('financial-transactions.show');
    Route::post('/financial-transactions/{financial_transaction}/post', [FinancialTransactionController::class, 'post'])->name('financial-transactions.post');
    Route::post('/financial-transactions/{financial_transaction}/reverse', [FinancialTransactionController::class, 'reverse'])->name('financial-transactions.reverse');
});