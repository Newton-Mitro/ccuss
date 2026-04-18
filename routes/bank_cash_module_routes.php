<?php


use App\BankCashModule\Controllers\BankAccountController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('bank-accounts')->name('bank-accounts.')->group(function () {
        Route::get('/', [BankAccountController::class, 'index'])->name('index');
        Route::get('/create', [BankAccountController::class, 'create'])->name('create');
        Route::post('/', [BankAccountController::class, 'store'])->name('store');
        Route::get('/{bankAccount}/edit', [BankAccountController::class, 'edit'])->name('edit');
        Route::put('/{bankAccount}', [BankAccountController::class, 'update'])->name('update');
        Route::delete('/{bankAccount}', [BankAccountController::class, 'destroy'])->name('destroy');
    });
});