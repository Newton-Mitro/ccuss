<?php

namespace App\DailyTransactions\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\LedgerAccount;
use App\Branch\Models\Branch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyCollectionController extends Controller
{
    public function index(Request $request)
    {

        $cashLedgerId = $request->input('cash_ledger_id');
        $cashSubledgerId = $request->input('cash_subledger_id');
        $cashLedger = LedgerAccount::find($cashLedgerId);

        $cashControl = LedgerAccount::where([
            ['name', 'Cash'],
            ['is_control_account', true],
            ['is_active', true],
        ])->first();

        $cashLedgers = $cashControl
            ? LedgerAccount::where('parent_id', $cashControl->id)
                ->where('is_active', true)
                ->where('is_control_account', false)
                ->orderBy('code')
                ->get()
            : collect();

        $cashSubledgers = $cashLedger ? $cashLedgers : [];

        return Inertia::render('daily-transactions/daily-collection-page', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cashLedgerId' => $cashLedgerId,
            'cashLedgers' => $cashLedgers,
            'cashSubledgerId' => $cashSubledgerId,
            'cashSubledgers' => $cashSubledgers,
            'activeFiscalYearId' => optional(FiscalYear::where('is_active', true)->first())->id,
            'activeFiscalPeriodId' => optional(FiscalPeriod::where('is_open', true)->first())->id,
            'userBranchId' => auth()->user()->branch_id,
            'backUrl' => route('vouchers.index'),
            'filters' => $request->only(['event', 'user_id', 'page', 'per_page']),
        ]);
    }

}