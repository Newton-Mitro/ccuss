<?php

use App\Branch\Controllers\BranchController;
use App\CostomerManagement\Address\Controllers\AddressController;
use App\CostomerManagement\Customer\Controllers\CustomerController;
use App\CostomerManagement\FamilyRelation\Controllers\FamilyRelationController;
use App\CostomerManagement\OnlineClient\Controllers\OnlineClientController;
use App\CostomerManagement\Signature\Controllers\SignatureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GlAccountController;
use App\Media\Controllers\MediaController;
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
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

require __DIR__ . '/settings.php';

Route::prefix('auth')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::resource('media', MediaController::class);
        Route::get('/api/media', [MediaController::class, 'getMedia'])->name('get-media');
        Route::resource('branches', BranchController::class);
        Route::resource('customers', CustomerController::class);
        Route::get('/api/search-customers', [CustomerController::class, 'searchCustomers'])->name('search-customers');
        Route::resource('addresses', AddressController::class);
        Route::resource('family-relations', FamilyRelationController::class);
        Route::resource('signatures', SignatureController::class);
        Route::resource('online-clients', OnlineClientController::class);

    });

Route::prefix('auth')->middleware(['auth',])->group(function () {
    Route::get('/gl-accounts', [GlAccountController::class, 'index'])->name('gl-accounts.index');
    Route::post('/gl-accounts', [GlAccountController::class, 'store'])->name('gl-accounts.store');
    Route::delete('/gl-accounts/{glAccount}', [GlAccountController::class, 'destroy'])->name('gl-accounts.destroy');
    Route::put('/gl-accounts/move', [GlAccountController::class, 'move'])->name('gl-accounts.move');

});
