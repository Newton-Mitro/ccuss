<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Accounting\Models\Account;
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
            'accounts' => Account::all(),
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
                    'RECEIPT',
                    'PAYMENT',
                    'JOURNAL',
                    'PURCHASE',
                    'SALE',
                    'DEBIT NOTE',
                    'CREDIT NOTE',
                    'PETTY CASH',
                    'CONTRA',
                ])
            ],
            'fiscal_year_id' => 'required|integer|exists:fiscal_years,id',
            'fiscal_period_id' => 'required|integer|exists:fiscal_periods,id',
            'branch_id' => 'nullable|integer|exists:branches,id',
            'status' => 'required|string',
            'narration' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.account_id' => 'required|integer|exists:accounts,id',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
            'lines.*.narration' => 'nullable|string',
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
                'account_id' => $line['account_id'],
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
                'narration' => $line['narration'] ?? null,
            ]);
        }

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher created successfully.');
    }

    public function show(Voucher $voucher)
    {
        return Inertia::render('accounting/vouchers/show', [
            'voucher' => $voucher->load([
                'lines.account',
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
            'accounts' => Account::all(),
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
                    'RECEIPT',
                    'PAYMENT',
                    'JOURNAL',
                    'PURCHASE',
                    'SALE',
                    'DEBIT NOTE',
                    'CREDIT NOTE',
                    'PETTY CASH',
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
            'lines.*.account_id' => 'required|integer|exists:accounts,id',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
            'lines.*.narration' => 'nullable|string',
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
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'narration' => $line['narration'] ?? null,
                ]);
            } else {
                $voucher->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'narration' => $line['narration'] ?? null,
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
        return Inertia::render('accounting/vouchers/debit_voucher', [
            'accounts' => Account::select('id', 'name')->get(),
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

    public function createCreditVoucher()
    {
        return Inertia::render('accounting/vouchers/credit_voucher');
    }

    public function createJournalVoucher()
    {
        return Inertia::render('accounting/vouchers/journal_voucher');
    }

    public function createContraVoucher()
    {
        return Inertia::render('accounting/vouchers/contra_voucher');
    }
}
