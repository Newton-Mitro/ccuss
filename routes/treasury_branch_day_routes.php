<?php

use App\TreasuryAndCash\Controllers\BranchDayController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'organization'])
    ->prefix('branch-days')
    ->name('branch-days.')
    ->group(function () {
        Route::get('/', [BranchDayController::class, 'index'])
            ->middleware('permission:branch_days.view')
            ->name('index');
        Route::get('/create', [BranchDayController::class, 'create'])
            ->middleware('permission:branch_days.open')
            ->name('create');
        Route::post('/', [BranchDayController::class, 'store'])
            ->middleware('permission:branch_days.open')
            ->name('store');
        Route::get('/{branchDay}', [BranchDayController::class, 'show'])
            ->middleware('permission:branch_days.view')
            ->name('show');
        Route::put('/{branchDay}/close', [BranchDayController::class, 'close'])
            ->middleware('permission:branch_days.close')
            ->name('close');
    });
