<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\FiscalPeriod;
use App\Branch\Models\Branch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Voucher::with(['lines.account', 'fiscalYear', 'fiscalPeriod', 'branch']);

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('voucher_no', 'like', "%{$request->search}%")
                    ->orWhere('reference', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        $vouchers = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('accounting/vouchers/index', [
            'vouchers' => $vouchers,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('accounting/vouchers/edit', [
            'ledger_accounts' => LedgerAccount::all(),
            'fiscalYears' => FiscalYear::all(),
            'fiscalPeriods' => FiscalPeriod::all(),
            'branches' => Branch::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'voucher_no' => 'required|string|unique:vouchers,voucher_no|max:50',
            'voucher_date' => 'required|date',
            'voucher_type' => [
                'required',
                Rule::in([
                    'CREDIT_OR_RECEIPT',
                    'DEBIT_OR_PAYMENT',
                    'JOURNAL_OR_NON_CASH',
                    'PURCHASE',
                    'SALE',
                    'DEBIT_NOTE',
                    'CREDIT_NOTE',
                    'PETTY_CASH',
                    'CONTRA',
                ])
            ],
            'fiscal_year_id' => 'required|integer|exists:fiscal_years,id',
            'fiscal_period_id' => 'required|integer|exists:fiscal_periods,id',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'status' => 'required|string',
            'narration' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.ledger_account_id' => 'required|integer|exists:ledger_accounts,id',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
            'lines.*.particulars' => 'nullable|string',
        ]);

        $voucher = Voucher::create([
            'voucher_no' => $data['voucher_no'],
            'voucher_date' => $data['voucher_date'],
            'voucher_type' => $data['voucher_type'],
            'fiscal_year_id' => $data['fiscal_year_id'],
            'fiscal_period_id' => $data['fiscal_period_id'],
            'branch_id' => $data['branch_id'] ?? null,
            'status' => $data['status'],
            'narration' => $data['narration'] ?? null,
        ]);

        foreach ($data['lines'] as $line) {
            $voucher->lines()->create([
                'ledger_account_id' => $line['ledger_account_id'],
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
                'particulars' => $line['particulars'] ?? null,
            ]);
        }

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher created successfully.');
    }

    public function show(Voucher $voucher)
    {
        return Inertia::render('accounting/vouchers/show', [
            'voucher' => $voucher->load([
                'lines.ledger_account',
                'fiscalYear',
                'fiscalPeriod',
                'branch',
            ]),
        ]);
    }

    public function edit(Voucher $voucher)
    {
        return Inertia::render('accounting/vouchers/edit', [
            'voucher' => $voucher->load('lines.account'),
            'ledger_accounts' => LedgerAccount::all(),
            'fiscalYears' => FiscalYear::all(),
            'fiscalPeriods' => FiscalPeriod::all(),
            'branches' => Branch::all(),
        ]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $data = $request->validate([
            'voucher_date' => 'required|date',
            'voucher_type' => [
                'required',
                Rule::in([
                    'CREDIT_OR_RECEIPT',
                    'DEBIT_OR_PAYMENT',
                    'JOURNAL_OR_NON_CASH',
                    'PURCHASE',
                    'SALE',
                    'DEBIT_NOTE',
                    'CREDIT_NOTE',
                    'PETTY_CASH',
                    'CONTRA',
                ])
            ],
            'fiscal_year_id' => 'required|integer|exists:fiscal_years,id',
            'fiscal_period_id' => 'required|integer|exists:fiscal_periods,id',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'status' => 'required|string',
            'narration' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.id' => 'nullable|integer|exists:voucher_lines,id',
            'lines.*.ledger_account_id' => 'required|integer|exists:ledger_accounts,id',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
            'lines.*.particulars' => 'nullable|string',
        ]);

        $voucher->update([
            'voucher_date' => $data['voucher_date'],
            'voucher_type' => $data['voucher_type'],
            'fiscal_year_id' => $data['fiscal_year_id'],
            'fiscal_period_id' => $data['fiscal_period_id'],
            'branch_id' => $data['branch_id'] ?? null,
            'status' => $data['status'],
            'narration' => $data['narration'] ?? null,
        ]);

        // Update lines
        $existingLineIds = $voucher->lines()->pluck('id')->toArray();
        $submittedLineIds = array_filter(array_column($data['lines'], 'id'));

        // Delete removed lines
        $linesToDelete = array_diff($existingLineIds, $submittedLineIds);
        if ($linesToDelete) {
            VoucherLine::whereIn('id', $linesToDelete)->delete();
        }

        // Upsert lines
        foreach ($data['lines'] as $line) {
            if (!empty($line['id'])) {
                $voucher->lines()->where('id', $line['id'])->update([
                    'ledger_account_id' => $line['ledger_account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'particulars' => $line['particulars'] ?? null,
                ]);
            } else {
                $voucher->lines()->create([
                    'ledger_account_id' => $line['ledger_account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'particulars' => $line['particulars'] ?? null,
                ]);
            }
        }

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher updated successfully.');
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        return back()->with('success', 'Voucher deleted successfully.');
    }

    public function createDebitVoucher()
    {
        $cashControl = LedgerAccount::where('name', 'Cash')
            ->where('is_control_account', true)
            ->where('is_active', true)
            ->first();

        if (!$cashControl) {
            return response()->json([]);
        }

        $cashLedgers = LedgerAccount::query()
            ->where('parent_id', $cashControl->id)   // only Cash children
            ->where('is_active', true)
            ->where('is_control_account', false)
            ->orderBy('code')
            ->get();

        return Inertia::render('accounting/vouchers/debit_voucher', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cashLedgers' => $cashLedgers,
            'activeFiscalYearId' => FiscalYear::where('is_active', true)->first()->id,
            'activeFiscalPeriodId' => FiscalPeriod::where('is_open', true)->first()->id,
            'userBranchId' => auth()->user()->branch_id,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'backUrl' => route('vouchers.index'), // Adjust route as needed
        ]);
    }

    public function createCreditVoucher()
    {
        return Inertia::render('accounting/vouchers/credit_voucher', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'backUrl' => route('vouchers.index'), // Adjust route as needed
        ]);
    }

    public function createJournalVoucher()
    {
        return Inertia::render('accounting/vouchers/journal_voucher', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'backUrl' => route('vouchers.index'), // Adjust route as needed
        ]);
    }

    public function createContraVoucher()
    {
        return Inertia::render('accounting/vouchers/contra_voucher', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'backUrl' => route('vouchers.index'), // Adjust route as needed
        ]);
    }
}
