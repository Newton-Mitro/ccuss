<?php

namespace App\TellerTransactions\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\InstrumentType;
use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Branch\Models\Branch;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TellerTransactionController extends Controller
{
    public function customerCashReceipt(Request $request)
    {

        $cashLedger = LedgerAccount::where([
            ['name', 'Cash In Hand'],
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

        $instrumentTypes = InstrumentType::all();

        $vouchers = Voucher::where('voucher_type', 'CREDIT_OR_RECEIPT')
            ->where('created_by', auth()->id())
            ->whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('teller-transactions/customer-cash-deposit/CustomerCashDepositPage', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscal_years' => FiscalYear::select('id', 'code')->get(),
            'fiscal_periods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cash_ledgers' => $cashLedgers,
            'cash_subledgers' => $cashSubledgers,
            'instrument_types' => $instrumentTypes,
            'lines' => [
                [
                    'id' => 1,
                    'voucher_id' => 0,
                    'ledger_account_id' => $cashLedger->id,
                    'ledger_account' => $cashLedger,
                    'subledger_id' => null,
                    'subledger_type' => null,
                    'subledger' => null,
                    'instrument_type_id' => 1,
                    'instrument_id' => null,
                    'debit' => 0,
                    'credit' => 0,
                    'particulars' => 'Cash In Hand',
                    'dr_cr' => 'DR',
                    'is_selected' => true
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

    public function customerCashPayment(Request $request)
    {

        $cashLedger = LedgerAccount::where([
            ['name', 'Cash In Hand'],
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
        $instrumentTypes = InstrumentType::all();
        $vouchers = Voucher::where('voucher_type', 'DEBIT_OR_PAYMENT')
            ->where('created_by', auth()->id())
            ->whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('teller-transactions/customer-cash-withdrawal/CustomerCashWithdrawalPage', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscal_years' => FiscalYear::select('id', 'code')->get(),
            'fiscal_periods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cash_ledgers' => $cashLedgers,
            'cash_subledgers' => $cashSubledgers,
            'instrument_types' => $instrumentTypes,
            'lines' => [
                [
                    'id' => 1,
                    'voucher_id' => 0,
                    'ledger_account_id' => $cashLedger->id,
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

    public function getCustomerCollectionLedgers(Request $request)
    {
        $loanInterestLedger = LedgerAccount::where([
            ['name', 'Loan Interest Income'],
            ['is_active', true],
        ])->first();

        $savingDepositLedger = LedgerAccount::where([
            ['name', 'Savings Deposit'],
            ['is_active', true],
        ])->first();

        $termDepositLedger = LedgerAccount::where([
            ['name', 'Term Deposit'],
            ['is_active', true],
        ])->first();


        return response()->json([
            [
                'id' => 2,
                'voucher_id' => 0,
                'ledger_account_id' => $savingDepositLedger->id,
                'ledger_account' => $savingDepositLedger,
                'subledger_id' => null,
                'subledger_type' => null,
                'subledger' => null,
                'instrument_type_id' => 1,
                'instrument_id' => null,
                'debit' => 0,
                'credit' => 500,
                'particulars' => 'tk. 500 cash deposited for savings deposit',
                'dr_cr' => 'CR',
                'is_selected' => true
            ],
            [
                'id' => 3,
                'voucher_id' => 0,
                'ledger_account_id' => $termDepositLedger->id,
                'ledger_account' => $termDepositLedger,
                'subledger_id' => null,
                'subledger_type' => null,
                'subledger' => null,
                'instrument_type_id' => 1,
                'instrument_id' => null,
                'debit' => 0,
                'credit' => 1500,
                'particulars' => 'tk. 1500 cash deposited for term deposit',
                'dr_cr' => 'CR',
                'is_selected' => true
            ],
            [
                'id' => 4,
                'voucher_id' => 0,
                'ledger_account_id' => $loanInterestLedger->id,
                'ledger_account' => $loanInterestLedger,
                'subledger_id' => null,
                'subledger_type' => null,
                'subledger' => null,
                'instrument_type_id' => 1,
                'instrument_id' => null,
                'debit' => 0,
                'credit' => 100,
                'particulars' => 'tk. 100 cash deposited for loan interest',
                'dr_cr' => 'CR',
                'is_selected' => true
            ],
        ]);
    }

}