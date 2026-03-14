<?php

use App\Branch\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseBackupController;
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
    Route::get('database/backup/history', [DatabaseBackupController::class, 'history'])
        ->name('backup.history');

    Route::get('database/backup/{id}/download', [DatabaseBackupController::class, 'download'])
        ->name('backup.download');
    Route::get('/database/backup', [DatabaseBackupController::class, 'index'])
        ->name('database.backup.index');
    Route::post('/database/backup', [DatabaseBackupController::class, 'backup'])
        ->name('database.backup.run');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/customer_routes.php';
require __DIR__ . '/cash_management_routes.php';
require __DIR__ . '/transaction_routes.php';
require __DIR__ . '/accounting_routes.php';


require __DIR__ . '/audit_routes.php';

