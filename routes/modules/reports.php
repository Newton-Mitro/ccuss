<?php

use App\Reports\Controllers\ReportExportController;
use Illuminate\Support\Facades\Route;

Route::get('/reports/{report}/export/{format}', [ReportExportController::class, 'export'])
    ->whereIn('report', [
        'trial-balance',
        'general-ledger',
        'profit-loss',
        'balance-sheet',
        'cash-flow',
        'shareholders-equity',
        'product-summary',
        'account-balances',
        'transactions',
        'account-statement',
    ])
    ->whereIn('format', ['pdf', 'xlsx', 'csv'])
    ->middleware(['auth', 'verified', 'organization'])
    ->name('reports.export');
