<?php

namespace App\TreasuryAndCashModule\Controllers;

use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\VoucherEntryModule\Models\VoucherEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashAdjustmentController extends Controller
{
    public function tellerCashAdjustmentPage(Request $request)
    {
        $teller_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/cash-adjustments/teller-cash-adjustment-page', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'teller_subledger_accounts' => $teller_subledger_accounts,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

}