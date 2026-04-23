<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LedgerAccountController extends Controller
{
    public function ledgerSearch(Request $request)
    {
        $search = trim($request->input('search', ''));
        if ($search === '') {
            return response()->json([]);
        }
        $ledgers = LedgerAccount::query()
            ->whereNotNull('parent_id')
            ->where('is_active', true)
            ->where('is_control_account', false)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->limit(20)
            ->get();
        return response()->json($ledgers);
    }

    public function cashLedgerList()
    {
        $cashControl = LedgerAccount::where('name', 'Cash')->where('is_control_account', true)->where('is_active', true)->first();
        if (!$cashControl) {
            return response()->json([]);
        }
        $ledgers = LedgerAccount::query()->where('parent_id', $cashControl->id)->where('is_active', true)
            ->where('is_control_account', false)->orderBy('code')->get();
        return response()->json($ledgers);
    }

    public function index(Request $request): Response
    {
        $fiscal_year_id = $request->input('fiscal_year_id');

        $glAccounts = LedgerAccount::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with([
                'childrenRecursive.childrenRecursive.childrenRecursive.childrenRecursive'
            ])
            ->orderBy('code')
            ->get();

        $fiscalYears = FiscalYear::query()
            ->orderBy('code', 'desc')
            ->get(['id', 'code']);

        $fiscalPeriods = FiscalPeriod::query()
            ->when($fiscal_year_id, fn($q) => $q->where('fiscal_year_id', $fiscal_year_id))
            ->orderBy('period_name', 'desc')
            ->get();

        return Inertia::render('general-accounting/chart-of-accounts/index', [
            'glAccounts' => $glAccounts,
            'fiscalYears' => $fiscalYears,
            'fiscalPeriods' => $fiscalPeriods,
            'fiscal_year_id' => $fiscal_year_id,
        ]);
    }

    public function destroy(LedgerAccount $ledgerAccount)
    {
        if ($ledgerAccount->children()->exists()) {
            return back()->with('error', 'Cannot delete account with children.');
        }
        $parent = $ledgerAccount->parent;
        $ledgerAccount->delete();
        if ($parent && $parent->children()->count() === 0) {
            $parent->update(['is_leaf' => true]);
        }
        return back()->with('success', 'Account deleted successfully.');
    }
}