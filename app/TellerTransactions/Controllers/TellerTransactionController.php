<?php

namespace App\TellerTransactions\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Branch\Models\Branch;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TellerTransactionController extends Controller
{
    public function deposit(Request $request)
    {

        $cashLedger = LedgerAccount::where([
            ['name', 'Cash in Hand'],
            ['is_active', true],
        ])->first();

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
        $vouchers = Voucher::where('voucher_type', 'CREDIT_OR_RECEIPT')
            ->where('created_by', auth()->id())
            ->whereDate('created_at', today())
            ->get();

        return Inertia::render('teller-transactions/customer-cash-deposit/CustomerCashDepositPage', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscal_years' => FiscalYear::select('id', 'code')->get(),
            'fiscal_periods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cash_ledgers' => $cashLedgers,
            'cash_subledgers' => $cashSubledgers,
            'lines' => [
                [
                    'id' => 0,
                    'voucher_id' => 0,
                    'ledger_account_id' => $cashLedger->id,
                    'ledger_account' => $cashLedger,
                    'subledger_id' => null,
                    'subledger_type' => null,
                    'subledger' => null,
                    'reference_id' => null,
                    'reference_type' => null,
                    'reference' => null,
                    'instrument_type' => 'CASH',
                    'instrument_no' => null,
                    'debit' => 0,
                    'credit' => 0,
                    'particulars' => 'Cash in Hand',

                ],
            ],
            'vouchers' => $vouchers,
            'user_branch_id' => auth()->user()->branch_id,
            'fiscal_year_id' => optional(FiscalYear::where('is_active', true)->first())->id,
            'fiscal_period_id' => optional(
                FiscalPeriod::where('is_open', true)
                    ->whereMonth('start_date', Carbon::now()->month)
                    ->whereYear('start_date', Carbon::now()->year)
                    ->first()
            )->id,
        ]);
    }

    public function withdrawal(Request $request)
    {

        $cashLedger = LedgerAccount::where([
            ['name', 'Cash in Hand'],
            ['is_active', true],
        ])->first();

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
        $vouchers = Voucher::where('voucher_type', 'DEBIT_OR_PAYMENT')
            ->where('created_by', auth()->id())
            ->whereDate('created_at', today())
            ->get();

        return Inertia::render('teller-transactions/customer-cash-withdrawal/CustomerCashWithdrawalPage', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscal_years' => FiscalYear::select('id', 'code')->get(),
            'fiscal_periods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cash_ledgers' => $cashLedgers,
            'cash_subledgers' => $cashSubledgers,
            'lines' => [
                [
                    'id' => 0,
                    'voucher_id' => 0,
                    'ledger_account_id' => $cashLedger->id,
                    'ledger_account' => $cashLedger,
                    'subledger_id' => null,
                    'subledger_type' => null,
                    'subledger' => null,
                    'reference_id' => null,
                    'reference_type' => null,
                    'reference' => null,
                    'instrument_type' => 'CASH',
                    'instrument_no' => null,
                    'debit' => 0,
                    'credit' => 0,
                    'particulars' => 'Cash in Hand',

                ],
            ],
            'vouchers' => $vouchers,
            'user_branch_id' => auth()->user()->branch_id,
            'fiscal_year_id' => optional(FiscalYear::where('is_active', true)->first())->id,
            'fiscal_period_id' => optional(
                FiscalPeriod::where('is_open', true)
                    ->whereMonth('start_date', Carbon::now()->month)
                    ->whereYear('start_date', Carbon::now()->year)
                    ->first()
            )->id,
        ]);
    }

}