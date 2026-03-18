<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseBackupController;
use App\SystemAdministration\Controllers\BranchController;
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
Route::get('/home', [DashboardController::class, 'home'])
    ->middleware(['auth', 'verified'])
    ->name('auth-home');

Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('branches', BranchController::class);
        // Route::resource('introducers', CustomerIntroducerController::class);
    });

Route::middleware(['auth',])->group(function () {
    Route::get('database/backups', [DatabaseBackupController::class, 'history'])->name('backup.history');
    Route::post('/database/backups', [DatabaseBackupController::class, 'backup'])->name('backup.run');
    Route::delete('/database/backups/{id}', [DatabaseBackupController::class, 'destroy'])->name('backup.destroy');
});

require __DIR__ . '/system_administration_routes.php';
require __DIR__ . '/settings_routes.php';
require __DIR__ . '/customer_module_routes.php';
require __DIR__ . '/branch_cash_and_treasury_routes.php';
require __DIR__ . '/finance_and_accounting_routes.php';


