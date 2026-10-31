<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    return Inertia::render('authentication/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'canRegister' => Features::enabled(Features::registration()),
        'status' => $request->session()->get('status'),
    ]);
})->middleware('guest:web')->name('home');

Route::get('/dashboard', [DashboardController::class, 'home'])
    ->middleware(['auth', 'verified', 'organization'])
    ->name('dashboard');

require __DIR__ . '/modules/administration_security.php';
require __DIR__ . '/modules/organization_settings.php';
require __DIR__ . '/modules/audit_compliance.php';
require __DIR__ . '/settings_routes.php';
require __DIR__ . '/modules/branch_operations.php';
require __DIR__ . '/modules/treasury_cash.php';
require __DIR__ . '/modules/customers_kyc.php';
require __DIR__ . '/modules/general_accounting.php';
require __DIR__ . '/modules/financial_services.php';
require __DIR__ . '/modules/reports.php';
