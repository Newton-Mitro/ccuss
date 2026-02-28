<?php
use App\DailyTransactions\Controllers\DailyCollectionController;
use Illuminate\Support\Facades\Route;


Route::prefix('daily-collection')->middleware(['auth'])->group(function () {
    // Global audit list
    Route::get('/', [DailyCollectionController::class, 'index'])
        ->name('daily-collection.index');


});