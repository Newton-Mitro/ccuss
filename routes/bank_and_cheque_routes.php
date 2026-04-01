<?php


use App\BankCashModule\Controllers\BankAccountController;
use App\BankCashModule\Controllers\BankBranchController;
use App\BankCashModule\Controllers\BankController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth'])->group(function () {

    // ------------------------
    // Banks
    // ------------------------
    Route::prefix('banks')->name('banks.')->group(function () {
        Route::get('/', [BankController::class, 'index'])->name('index');
        Route::get('/create', [BankController::class, 'create'])->name('create');
        Route::post('/', [BankController::class, 'store'])->name('store');
        Route::get('/{bank}/edit', [BankController::class, 'edit'])->name('edit');
        Route::put('/{bank}', [BankController::class, 'update'])->name('update');
        Route::delete('/{bank}', [BankController::class, 'destroy'])->name('destroy');
    });

    // ------------------------
    // Bank Branches
    // ------------------------
    Route::prefix('bank-branches')->name('bank-branches.')->group(function () {
        Route::get('/', [BankBranchController::class, 'index'])->name('index');
        Route::get('/create', [BankBranchController::class, 'create'])->name('create');
        Route::post('/', [BankBranchController::class, 'store'])->name('store');
        Route::get('/{bankBranch}/edit', [BankBranchController::class, 'edit'])->name('edit');
        Route::put('/{bankBranch}', [BankBranchController::class, 'update'])->name('update');
        Route::delete('/{bankBranch}', [BankBranchController::class, 'destroy'])->name('destroy');
    });

    // ------------------------
    // Bank Accounts
    // ------------------------
    Route::prefix('bank-accounts')->name('bank-accounts.')->group(function () {
        Route::get('/', [BankAccountController::class, 'index'])->name('index');
        Route::get('/create', [BankAccountController::class, 'create'])->name('create');
        Route::post('/', [BankAccountController::class, 'store'])->name('store');
        Route::get('/{bankAccount}/edit', [BankAccountController::class, 'edit'])->name('edit');
        Route::put('/{bankAccount}', [BankAccountController::class, 'update'])->name('update');
        Route::delete('/{bankAccount}', [BankAccountController::class, 'destroy'])->name('destroy');
    });

});