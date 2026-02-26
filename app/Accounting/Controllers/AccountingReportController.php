<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AccountingReportController
{
    /*
    |--------------------------------------------------------------------------
    | Trial Balance
    |--------------------------------------------------------------------------
    */


    public function trialBalance(Request $request): Response
    {
        $fiscalYearId = $request->integer('fiscal_year_id');
        $fiscalPeriodId = $request->integer('fiscal_period_id');

        $query = DB::table('view_trial_balance')
            ->select(
                'ledger_account_id',
                'account_code',
                'account_name',
                'account_type',
                'fiscal_year_id',
                'fiscal_year_code',
                'fiscal_period_id',
                'period_name',
                DB::raw('CAST(total_debit AS DECIMAL(15,2)) as total_debit'),
                DB::raw('CAST(total_credit AS DECIMAL(15,2)) as total_credit'),
                DB::raw('CAST(balance AS DECIMAL(15,2)) as balance')
            )
            ->orderBy('account_code');

        // Apply filters if selected
        if ($fiscalYearId) {
            $query->where('fiscal_year_id', $fiscalYearId);
        }

        if ($fiscalPeriodId) {
            $query->where('fiscal_period_id', $fiscalPeriodId);
        }

        return Inertia::render('accounting/reports/trial-balance-page', [
            'trialBalance' => $query->get(),
            'fiscalYears' => FiscalYear::orderBy('id')->get(),
            'fiscalPeriods' => FiscalPeriod::orderBy('id')->get(),
            'selectedFiscalYear' => $fiscalYearId,
            'selectedFiscalPeriod' => $fiscalPeriodId,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Profit & Loss
    |--------------------------------------------------------------------------
    */
    public function profitAndLoss(Request $request): Response
    {
        $fiscalYearId = $request->input('fiscal_year_id');
        $fiscalPeriodId = $request->input('fiscal_period_id');

        $query = DB::table('view_profit_and_loss')
            ->orderBy('category')
            ->orderBy('account_code');

        if ($fiscalYearId) {
            $query->where('fiscal_year_id', $fiscalYearId);
        }

        if ($fiscalPeriodId) {
            $query->where('fiscal_period_id', $fiscalPeriodId);
        }

        return Inertia::render('accounting/reports/profit-and-loss-page', [
            'profitAndLoss' => $query->get(),
            'fiscalYears' => FiscalYear::all(),
            'fiscalPeriods' => FiscalPeriod::all(),
            'selectedFiscalYear' => $fiscalYearId,
            'selectedFiscalPeriod' => $fiscalPeriodId,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Balance Sheet
    |--------------------------------------------------------------------------
    */
    public function balanceSheet(Request $request): Response
    {
        $fiscalYearId = $request->input('fiscal_year_id');

        $balanceSheet = DB::table('view_balance_sheet')
            ->when(
                $fiscalYearId,
                fn($q) =>
                $q->where('fiscal_year_id', $fiscalYearId)
            )
            ->orderBy('category')
            ->orderBy('account_code')
            ->get();

        return Inertia::render('accounting/reports/balance-sheet-page', [
            'balanceSheet' => $balanceSheet,
            'fiscalYears' => FiscalYear::all(),
            'selectedFiscalYear' => $fiscalYearId,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Cash Flow Statement
    |--------------------------------------------------------------------------
    */
    public function cashFlow(Request $request): Response
    {
        $fiscalYearId = $request->integer('fiscal_year_id');
        $fiscalPeriodId = $request->integer('fiscal_period_id');

        $query = DB::table('view_cash_flow')
            ->orderBy('fiscal_period_id')
            ->orderBy('cash_category');

        if ($fiscalYearId) {
            $query->where('fiscal_year_id', $fiscalYearId);
        }

        if ($fiscalPeriodId) {
            $query->where('fiscal_period_id', $fiscalPeriodId);
        }

        return Inertia::render('accounting/reports/cash-flow-page', [
            'cashFlows' => $query->get(), // ✅ plural & consistent
            'fiscalYears' => FiscalYear::orderBy('id')->get(),
            'fiscalPeriods' => FiscalPeriod::orderBy('id')->get(),
            'selectedFiscalYear' => $fiscalYearId,
            'selectedFiscalPeriod' => $fiscalPeriodId,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Statement of Shareholders’ Equity
    |--------------------------------------------------------------------------
    */
    public function shareholdersEquity(Request $request): Response
    {
        $fiscalYearId = $request->input('fiscal_year_id');
        $fiscalPeriodId = $request->input('fiscal_period_id');

        $query = DB::table('view_shareholders_equity')
            ->orderBy('account_code')
            ->orderBy('fiscal_period_id');

        /*
         |------------------------------------------------------------
         | Filter by Fiscal Period (direct)
         |------------------------------------------------------------
         */
        if ($fiscalPeriodId) {
            $query->where('fiscal_period_id', $fiscalPeriodId);
        }

        /*
         |------------------------------------------------------------
         | Filter by Fiscal Year (via fiscal_periods table)
         |------------------------------------------------------------
         */
        if ($fiscalYearId) {
            $periodIds = FiscalPeriod::where('fiscal_year_id', $fiscalYearId)
                ->pluck('id');

            $query->whereIn('fiscal_period_id', $periodIds);
        }

        return Inertia::render('accounting/reports/shareholders-equity-page', [
            'equityStatement' => $query->get(),
            'fiscalYears' => FiscalYear::orderBy('start_date')->get(),
            'fiscalPeriods' => FiscalPeriod::orderBy('start_date')->get(),
            'selectedFiscalYear' => $fiscalYearId,
            'selectedFiscalPeriod' => $fiscalPeriodId,
        ]);
    }
}