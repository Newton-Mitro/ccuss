<?php

namespace App\TreasuryAndCashModule\Controllers;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\VoucherEntryModule\Models\VoucherEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TellerTransactionController extends Controller
{
    public function customerCashReceipt(Request $request)
    {
        $cash_subledger_accounts = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])
            ->whereHas('subledger', function ($query) {
                $query->where('subledger_sub_type', 'teller_cashes');
            })
            ->get();

        $collection_ledgers = SubledgerAccount::all();


        $voucher_entries = VoucherEntry::all();

        return Inertia::render('treasury-and-cash/customer-cash-deposit/CustomerCashDepositPage', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cash_subledger_accounts' => $cash_subledger_accounts,
            'lines' => $collection_ledgers,
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
        ]);
    }

    public function customerCashPayment(Request $request)
    {
        $cashLedger = LedgerAccount::where('name', 'Cash In Hand')
            ->where('is_active', true)
            ->first();

        $cashControl = LedgerAccount::where([
            ['name', 'Cash'],
            ['is_control_account', true],
            ['is_active', true],
        ])->first();

        $cashLedgers = $cashControl
            ? LedgerAccount::where('parent_id', $cashControl->id)
                ->where('is_closed', false)
                ->where('is_control_account', false)
                ->orderBy('code')
                ->get()
            : collect();

        $cashSubledgers = $cashLedger ? $cashLedgers : collect();

        $voucher_entries = [];

        return Inertia::render('treasury-and-cash/customer-cheque-withdrawal/CustomerCashWithdrawalPage', [
            'ledger_accounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
            'fiscal_years' => FiscalYear::select('id', 'code')->get(),
            'fiscal_periods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cash_ledgers' => $cashLedgers,
            'cash_subledgers' => $cashSubledgers,
            'lines' => [
                [
                    'id' => 1,
                    'voucher_entry_id' => 0,
                    'ledger_account_id' => $cashLedger?->id,
                    'ledger_account' => $cashLedger,
                    'subledger_id' => null,
                    'subledger_type' => null,
                    'subledger' => null,
                    'instrument_type_id' => 1,
                    'instrument_id' => null,
                    'debit' => 0,
                    'credit' => 0,
                    'particulars' => 'Cash In Hand',
                    'dr_cr' => 'CR',
                    'is_selected' => true
                ],
            ],
            'voucher_entries' => $voucher_entries,
            'user_branch_id' => auth()->user()->branch_id,
            'fiscal_year_id' => optional(FiscalYear::where('is_closed', false)->first())->id,
            'fiscal_period_id' => optional(
                FiscalPeriod::where('status', 'open')
                    ->whereMonth('start_date', Carbon::now()->month)
                    ->whereYear('start_date', Carbon::now()->year)
                    ->first()
            )->id,
        ]);
    }

    public function getCustomerCollectionLedgers(Request $request)
    {
        $collection_ledgers = SubledgerAccount::with([
            'accountable',
            'subledger',
            'subledger.glAccount',
        ])->get();


        return response()->json($collection_ledgers);
    }

    public function getWithdrawableAccounts(Request $request)
    {
        $savingDepositLedger = LedgerAccount::where('name', 'Savings Deposit')->first();

        return response()->json([
            [
                'id' => 2,
                'voucher_entry_id' => 0,
                'ledger_account_id' => $savingDepositLedger?->id,
                'ledger_account' => $savingDepositLedger,
                'subledger_id' => null,
                'subledger_type' => null,
                'subledger' => null,
                'instrument_type_id' => 1,
                'instrument_id' => null,
                'debit' => 0,
                'credit' => 0,
                'particulars' => 'tk. 500 cash withdrawn from savings deposit',
                'dr_cr' => 'DR',
                'is_selected' => true
            ],
        ]);
    }
}