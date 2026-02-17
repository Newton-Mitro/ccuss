<?php

use App\Branch\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    return Inertia::render('auth/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'canRegister' => Features::enabled(Features::registration()),
        'status' => $request->session()->get('status'),
    ]);
})->middleware('guest:web')->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('branches', BranchController::class);
        // Route::resource('introducers', CustomerIntroducerController::class);
    });

require __DIR__ . '/settings.php';
require __DIR__ . '/customer_routes.php';
require __DIR__ . '/accounting_routes.php';


