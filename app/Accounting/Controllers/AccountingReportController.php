<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\LedgerAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class AccountingReportController
{
    // Trial Balance
    public function trialBalance(Request $request): Response
    {
        // Fetch trial balance data from your view
        $trialBalance = DB::table('view_trial_balance')
            ->select('ledger_account_id', 'account_code', 'account_name', 'account_type', 'total_debit', 'total_credit', 'balance')
            ->orderBy('account_code')
            ->get();

        return Inertia::render('accounting/reports/trial-balance-page', [
            'trialBalance' => $trialBalance,
        ]);
    }

    // Profit & Loss Report
    public function profitAndLoss(Request $request): Response
    {
        // Optional filters from query parameters
        $fiscalYearId = $request->input('fiscal_year_id');
        $fiscalPeriodId = $request->input('fiscal_period_id');

        $query = DB::table('view_profit_and_loss')
            ->select('ledger_account_id', 'category', 'account_name', 'amount', 'fiscal_year_id', 'fiscal_period_id')
            ->orderBy('category')
            ->orderBy('account_name');

        // Filter by fiscal year
        if ($fiscalYearId) {
            $query->where('fiscal_year_id', $fiscalYearId);
        }

        // Filter by fiscal period
        if ($fiscalPeriodId) {
            $query->where('fiscal_period_id', $fiscalPeriodId);
        }

        $profitAndLoss = $query->get();

        $fiscalYears = FiscalYear::all();

        $fiscalPeriods = FiscalPeriod::all();

        return Inertia::render('accounting/reports/profit-and-loss-page', [
            'profitAndLoss' => $profitAndLoss,
            'fiscalYears' => $fiscalYears,
            'selectedFiscalYear' => $fiscalYearId,
            'selectedFiscalPeriod' => $fiscalPeriodId,
            'fiscalPeriods' => $fiscalPeriods
        ]);
    }

    // Controller Example
    public function balanceSheet(Request $request): Response
    {
        $fiscalYearId = $request->input('fiscal_year_id');

        $query = DB::table('view_balance_sheet')
            ->select('ledger_account_id', 'category', 'account_name', 'balance');

        $query->where('fiscal_year_id', $fiscalYearId);

        $balanceSheet = $query->orderBy('category')
            ->orderBy('account_name')
            ->get();

        $fiscalYears = FiscalYear::all();

        return Inertia::render('accounting/reports/balance-sheet-page', [
            'balanceSheet' => $balanceSheet,
            'fiscalYears' => $fiscalYears,
            'selectedFiscalYear' => $fiscalYearId,
        ]);
    }
}