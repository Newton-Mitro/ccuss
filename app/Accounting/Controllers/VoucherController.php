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
    /* =====================================================
     |  INDEX
     ===================================================== */
    public function index(Request $request): Response
    {
        $query = Voucher::with([
            'lines.ledgerAccount',
            'fiscalYear',
            'fiscalPeriod',
            'branch',
        ]);

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

        return Inertia::render('accounting/vouchers/index', [
            'vouchers' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    /* =====================================================
     |  CREATE
     ===================================================== */
    public function create(): Response
    {
        return Inertia::render('accounting/vouchers/edit', [
            'ledger_accounts' => LedgerAccount::all(),
            'fiscalYears' => FiscalYear::all(),
            'fiscalPeriods' => FiscalPeriod::all(),
            'branches' => Branch::all(),
        ]);
    }

    /* =====================================================
     |  STORE
     ===================================================== */
    public function store(Request $request)
    {
        $data = $this->validateVoucher($request);

        // Enforce debit / credit XOR
        $this->validateDebitCredit($data['lines']);

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
            $voucher->lines()->create($this->linePayload($line));
        }

        return redirect()
            ->route('vouchers.index')
            ->with('success', 'Voucher created successfully.');
    }

    /* =====================================================
     |  SHOW
     ===================================================== */
    public function show(Voucher $voucher): Response
    {
        return Inertia::render('accounting/vouchers/show', [
            'voucher' => $voucher->load([
                'lines.ledgerAccount',
                'fiscalYear',
                'fiscalPeriod',
                'branch',
            ]),
        ]);
    }

    /* =====================================================
     |  EDIT
     ===================================================== */
    public function edit(Voucher $voucher): Response
    {
        return Inertia::render('accounting/vouchers/edit', [
            'voucher' => $voucher->load('lines.ledgerAccount'),
            'ledger_accounts' => LedgerAccount::all(),
            'fiscalYears' => FiscalYear::all(),
            'fiscalPeriods' => FiscalPeriod::all(),
            'branches' => Branch::all(),
        ]);
    }

    /* =====================================================
     |  UPDATE
     ===================================================== */
    public function update(Request $request, Voucher $voucher)
    {
        $data = $this->validateVoucher($request, true);

        $this->validateDebitCredit($data['lines']);

        $voucher->update([
            'voucher_date' => $data['voucher_date'],
            'voucher_type' => $data['voucher_type'],
            'fiscal_year_id' => $data['fiscal_year_id'],
            'fiscal_period_id' => $data['fiscal_period_id'],
            'branch_id' => $data['branch_id'] ?? null,
            'status' => $data['status'],
            'narration' => $data['narration'] ?? null,
        ]);

        // Sync voucher lines
        $existingIds = $voucher->lines()->pluck('id')->toArray();
        $submittedIds = array_filter(array_column($data['lines'], 'id'));

        $toDelete = array_diff($existingIds, $submittedIds);
        if ($toDelete) {
            VoucherLine::whereIn('id', $toDelete)->delete();
        }

        foreach ($data['lines'] as $line) {
            if (!empty($line['id'])) {
                $voucher->lines()
                    ->where('id', $line['id'])
                    ->update($this->linePayload($line));
            } else {
                $voucher->lines()->create($this->linePayload($line));
            }
        }

        return redirect()
            ->route('vouchers.index')
            ->with('success', 'Voucher updated successfully.');
    }

    /* =====================================================
     |  DELETE
     ===================================================== */
    public function destroy(Voucher $voucher)
    {
        $voucher->delete();

        return back()->with('success', 'Voucher deleted successfully.');
    }

    /* =====================================================
     |  SPECIALIZED VOUCHERS
     ===================================================== */
    public function createDebitVoucher(Request $request): Response
    {
        $cashLedgerId = $request->input('cash_ledger_id');
        $cashSubledgerId = $request->input('cash_subledger_id');

        $cashLedger = LedgerAccount::find($cashLedgerId);

        $cashControl = LedgerAccount::where('name', 'Cash')
            ->where('is_control_account', true)
            ->where('is_active', true)
            ->first();

        $cashLedgers = $cashControl
            ? LedgerAccount::where('parent_id', $cashControl->id)
                ->where('is_active', true)
                ->where('is_control_account', false)
                ->orderBy('code')
                ->get()
            : collect();

        if ($cashLedger) {
            if ($cashLedger->name === 'Cash in Hand') {
                $cashSubledgers = $cashLedgers;
            } else {
                $cashSubledgers = $cashLedgers;
            }
        } else {
            $cashSubledgers = [];
        }

        return Inertia::render('accounting/vouchers/debit_voucher', [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'cashLedgerId' => $cashLedgerId,
            'cashLedgers' => $cashLedgers,
            'cashSubledgerId' => $cashSubledgerId,
            'cashSubledgers' => $cashSubledgers ?? [],
            'activeFiscalYearId' => optional(FiscalYear::where('is_active', true)->first())->id,
            'activeFiscalPeriodId' => optional(FiscalPeriod::where('is_open', true)->first())->id,
            'userBranchId' => auth()->user()->branch_id,
            'backUrl' => route('vouchers.index'),
        ]);
    }

    public function createCreditVoucher(): Response
    {
        return $this->simpleVoucherView('credit_voucher');
    }

    public function createJournalVoucher(): Response
    {
        return $this->simpleVoucherView('journal_voucher');
    }

    public function createContraVoucher(): Response
    {
        return $this->simpleVoucherView('contra_voucher');
    }

    /* =====================================================
     |  HELPERS
     ===================================================== */
    private function validateVoucher(Request $request, bool $updating = false): array
    {
        return $request->validate([
            'voucher_no' => $updating
                ? 'sometimes|string|max:50'
                : 'required|string|unique:vouchers,voucher_no|max:50',

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
                ]),
            ],
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'branch_id' => 'nullable|exists:branches,id',
            'status' => 'required|string',
            'narration' => 'nullable|string',

            'lines' => 'required|array|min:1',
            'lines.*.id' => 'nullable|exists:voucher_lines,id',
            'lines.*.ledger_account_id' => 'required|exists:ledger_accounts,id',

            'lines.*.subledger_id' => 'nullable|integer',
            'lines.*.subledger_type' => 'nullable|string',

            'lines.*.reference_id' => 'nullable|integer',
            'lines.*.reference_type' => 'nullable|string',

            'lines.*.instrument_type' => 'nullable|string|max:50',
            'lines.*.instrument_no' => 'nullable|string|max:100',

            'lines.*.particulars' => 'nullable|string',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
        ]);
    }

    private function validateDebitCredit(array $lines): void
    {
        foreach ($lines as $line) {
            $debit = $line['debit'] ?? 0;
            $credit = $line['credit'] ?? 0;

            if (
                ($debit > 0 && $credit > 0) ||
                ($debit == 0 && $credit == 0)
            ) {
                abort(422, 'Each voucher line must have either debit or credit.');
            }
        }
    }

    private function linePayload(array $line): array
    {
        return [
            'ledger_account_id' => $line['ledger_account_id'],
            'subledger_id' => $line['subledger_id'] ?? null,
            'subledger_type' => $line['subledger_type'] ?? null,
            'reference_id' => $line['reference_id'] ?? null,
            'reference_type' => $line['reference_type'] ?? null,
            'instrument_type' => $line['instrument_type'] ?? null,
            'instrument_no' => $line['instrument_no'] ?? null,
            'particulars' => $line['particulars'] ?? null,
            'debit' => $line['debit'] ?? 0,
            'credit' => $line['credit'] ?? 0,
        ];
    }

    private function simpleVoucherView(string $view): Response
    {
        return Inertia::render("accounting/vouchers/{$view}", [
            'ledger_accounts' => LedgerAccount::select('id', 'name')->get(),
            'fiscalYears' => FiscalYear::select('id', 'code')->get(),
            'fiscalPeriods' => FiscalPeriod::select('id', 'period_name', 'fiscal_year_id')->get(),
            'branches' => Branch::select('id', 'name')->get(),
            'backUrl' => route('vouchers.index'),
        ]);
    }
}