<?php
use App\DailyTransactions\Controllers\DailyCollectionController;
use Illuminate\Support\Facades\Route;


Route::prefix('customer-cash-collection')->middleware(['auth'])->group(function () {
    // Global audit list
    Route::get('/', [DailyCollectionController::class, 'index'])
        ->name('collection.index');


});