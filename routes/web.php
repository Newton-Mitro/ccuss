<?php

use App\Http\Controllers\DashboardController;
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

Route::get('/dashboard', [DashboardController::class, 'home'])
    ->middleware(['auth', 'verified', 'organization'])
    ->name('dashboard');





require __DIR__ . '/system_administration_routes.php';
require __DIR__ . '/settings_routes.php';
require __DIR__ . '/customer_module_routes.php';
require __DIR__ . '/general_accounting_routes.php';
require __DIR__ . '/financial_services_routes.php';


