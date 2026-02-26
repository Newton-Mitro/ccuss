<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use App\Accounting\Models\LedgerAccount;
use App\Accounting\Models\Voucher;
use App\Accounting\Models\VoucherLine;
use App\Accounting\Requests\StoreVoucherRequest;
use App\Accounting\Requests\UpdateVoucherRequest;
use App\Branch\Models\Branch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('accounting/vouchers/index', [
            'vouchers' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
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
     |  SPECIALIZED VOUCHERS
     ===================================================== */
    public function createDebitVoucher(Request $request): Response
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

        return Inertia::render('accounting/vouchers/debit_voucher', [
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
     |  STORE
     ===================================================== */
    public function store(StoreVoucherRequest $request)
    {
        $data = $request->validated();
        $this->validateDebitCredit($data['lines']);

        DB::transaction(function () use ($data) {

            $voucherNo = $this->generateVoucherNo(
                $data['voucher_type'],
                $data['fiscal_year_id']
            );

            $voucher = Voucher::create([
                'voucher_no' => $voucherNo,
                'voucher_date' => $data['voucher_date'],
                'voucher_type' => $data['voucher_type'],
                'fiscal_year_id' => $data['fiscal_year_id'],
                'fiscal_period_id' => $data['fiscal_period_id'],
                'branch_id' => $data['branch_id'] ?? null,
                'narration' => $data['narration'] ?? null,
                'status' => $data['status'],

                // audit
                'created_by' => Auth::id(),
                'posted_by' => Auth::id(),
            ]);

            // lifecycle timestamps
            if ($voucher->status === Voucher::STATUS_POSTED) {
                $voucher->update(['posted_at' => now()]);
            }

            if ($voucher->status === Voucher::STATUS_APPROVED) {
                $voucher->update([
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                ]);
            }

            foreach ($data['lines'] as $line) {
                $voucher->lines()->create($this->linePayload($line));
            }
        });

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
                'creator',
                'poster',
                'approver',
                'rejector',
                'updater',
            ]),
        ]);
    }

    /* =====================================================
     |  EDIT
     ===================================================== */
    public function edit(Request $request, Voucher $voucher): Response
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

        return Inertia::render('accounting/vouchers/edit', [
            'voucher' => $voucher->load('lines.ledgerAccount'),
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
        ]);
    }

    /* =====================================================
     |  UPDATE
     ===================================================== */
    public function update(UpdateVoucherRequest $request, Voucher $voucher)
    {
        $data = $request->validated();
        $this->validateDebitCredit($data['lines']);

        DB::transaction(function () use ($voucher, $data) {

            $voucher->update([
                'voucher_date' => $data['voucher_date'],
                'voucher_type' => $data['voucher_type'],
                'fiscal_year_id' => $data['fiscal_year_id'],
                'fiscal_period_id' => $data['fiscal_period_id'],
                'branch_id' => $data['branch_id'] ?? null,
                'status' => $data['status'],
                'narration' => $data['narration'] ?? null,
            ]);

            // lifecycle handling
            if ($voucher->status === Voucher::STATUS_POSTED && !$voucher->posted_at) {
                $voucher->update([
                    'posted_by' => Auth::id(),
                    'posted_at' => now(),
                ]);
            }

            if ($voucher->status === Voucher::STATUS_APPROVED && !$voucher->approved_at) {
                $voucher->update([
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                ]);
            }

            if ($voucher->status === Voucher::STATUS_CANCELLED && !$voucher->rejected_at) {
                $voucher->update([
                    'rejected_by' => Auth::id(),
                    'rejected_at' => now(),
                ]);
            }

            // sync lines
            $existingIds = $voucher->lines()->pluck('id')->toArray();
            $submittedIds = array_filter(array_column($data['lines'], 'id'));

            VoucherLine::whereIn(
                'id',
                array_diff($existingIds, $submittedIds)
            )->delete();

            foreach ($data['lines'] as $line) {
                $voucher->lines()->updateOrCreate(
                    ['id' => $line['id'] ?? null],
                    $this->linePayload($line)
                );
            }
        });

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

    private function validateDebitCredit(array $lines): void
    {
        foreach ($lines as $line) {
            $debit = $line['debit'] ?? 0;
            $credit = $line['credit'] ?? 0;

            if (($debit > 0 && $credit > 0) || ($debit == 0 && $credit == 0)) {
                abort(422, 'Each voucher line must have either debit or credit.');
            }
        }
    }

    private function generateVoucherNo(string $type, int $fiscalYearId): string
    {
        $map = [
            'CREDIT_OR_RECEIPT' => 'CR',
            'DEBIT_OR_PAYMENT' => 'DV',
            'JOURNAL_OR_NON_CASH' => 'JV',
            'PURCHASE' => 'PV',
            'SALE' => 'SV',
            'DEBIT_NOTE' => 'DN',
            'CREDIT_NOTE' => 'CN',
            'PETTY_CASH' => 'PC',
            'CONTRA' => 'CV',
        ];

        $prefix = $map[$type] ?? 'VC';
        $yearCode = FiscalYear::findOrFail($fiscalYearId)->code;

        $last = Voucher::where('voucher_type', $type)
            ->where('fiscal_year_id', $fiscalYearId)
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $next = $last && preg_match('/(\d+)$/', $last->voucher_no, $m)
            ? ((int) $m[1]) + 1
            : 1;

        return sprintf('%s-%s-%06d', $prefix, $yearCode, $next);
    }

    private function linePayload(array $line): array
    {
        return [
            'ledger_account_id' => $line['ledger_account_id'],
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