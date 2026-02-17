<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\Voucher;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VoucherController extends Controller
{

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $txCode = $request->input('tx_code'); // optional filter for transaction type/code

        $query = Voucher::with('lines');

        // 🔍 Search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('tx_ref', 'like', "%{$search}%")
                    ->orWhere('memo', 'like', "%{$search}%");
            });
        }

        // 🏷️ Transaction code/type filter
        if (!empty($txCode) && $txCode !== 'all') {
            $query->where('tx_code', $txCode);
        }

        // 📄 Paginate with query string
        $journalEntries = $query->latest()->paginate($perPage)->withQueryString();

        // ✅ Inertia response with filters
        return Inertia::render('accounting/vouchers/index', [
            'vouchers' => $journalEntries,
            'filters' => $request->only(['search', 'tx_code', 'per_page', 'page']),
        ]);
    }

    public function createDebitVoucher()
    {
        return Inertia::render('accounting/vouchers/debit_voucher');
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

    public function store(Request $request)
    {
        $type = $request->type;

        $rules = [
            'type' => ['required', Rule::in(['debit', 'credit', 'journal', 'transfer', 'contra'])],
            'voucher_no' => 'required|string|unique:journal_entries,voucher_no|max:50',
            'date' => 'required|date',
            'narration' => 'nullable|string',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ];

        switch ($type) {
            case 'debit':
            case 'credit':
                $rules = array_merge($rules, [
                    'account_id' => 'required|integer',
                    'amount' => 'required|numeric|min:0.01',
                ]);
                break;

            case 'transfer':
            case 'contra':
                $rules = array_merge($rules, [
                    'from_account_id' => 'required|integer',
                    'to_account_id' => 'required|integer|different:from_account_id',
                    'amount' => 'required|numeric|min:0.01',
                ]);
                break;

            case 'journal':
                $rules = array_merge($rules, [
                    'rows' => 'required|array|min:2',
                    'rows.*.account_id' => 'required|integer|exists:gl_accounts,id',
                    'rows.*.debit' => 'nullable|numeric|min:0',
                    'rows.*.credit' => 'nullable|numeric|min:0',
                    'rows.*.subledger_type' => 'nullable|string',
                    'rows.*.subledger_id' => 'nullable|integer',
                    'rows.*.associate_ledger_type' => 'nullable|string',
                    'rows.*.associate_ledger_id' => 'nullable|integer',
                ]);
                break;
        }

        $data = $request->validate($rules);

        $journalEntry = Voucher::create([
            'tx_code' => strtoupper($type),
            'tx_ref' => $request->voucher_no,
            'posted_at' => $request->date,
            'branch_id' => $request->branch_id,
            'memo' => $request->narration,
        ]);

        // Create journal lines if it's a journal voucher
        if ($type === 'journal' && isset($data['rows'])) {
            foreach ($data['rows'] as $row) {
                $journalEntry->lines()->create([
                    'account_id' => $row['account_id'],
                    'debit' => $row['debit'] ?? 0,
                    'credit' => $row['credit'] ?? 0,
                    'subledger_type' => $row['subledger_type'] ?? null,
                    'subledger_id' => $row['subledger_id'] ?? null,
                    'associate_ledger_type' => $row['associate_ledger_type'] ?? null,
                    'associate_ledger_id' => $row['associate_ledger_id'] ?? null,
                ]);
            }
        }

        return redirect()->route('vouchers.index')
            ->with('success', ucfirst($type) . ' voucher created successfully.');
    }

    public function show(Voucher $voucher)
    {
        return Inertia::render('accounting/vouchers/show', [
            'voucher' => $voucher->load('lines'),
        ]);
    }

    public function edit(Voucher $voucher)
    {
        return Inertia::render('accounting/vouchers/edit', [
            'voucher' => $voucher->load('lines'),
            'type' => $voucher->tx_code,
        ]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $data = $request->validate([
            'narration' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $voucher->update([
            'memo' => $data['narration'],
            'posted_at' => $data['date'],
        ]);

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher updated successfully.');
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();

        return back()->with('success', 'Voucher deleted successfully.');
    }
}
