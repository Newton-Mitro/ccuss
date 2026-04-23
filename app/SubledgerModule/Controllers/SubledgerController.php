<?php

namespace App\SubledgerModule\Controllers;

use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\Subledger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubledgerController extends Controller
{
    public function index(Request $request)
    {
        $query = Subledger::with('glAccount');

        // ✅ Optional search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // ✅ Optional type filter (future-ready)
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // ✅ Optional sub_type filter
        if ($subType = $request->input('sub_type')) {
            $query->where('sub_type', $subType);
        }

        $subledgers = $query->latest()
            ->paginate(
                $request->input('per_page', 10)
            )
            ->withQueryString();

        return Inertia::render('subledger-module/subledgers/list-subledgers-page', [
            'subledgers' => $subledgers,
            'filters' => $request->only([
                'search',
                'per_page',
                'page',
                'type',
                'sub_type',
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('subledger-module/subledgers/create-subledger-page', [
            'glAccounts' => LedgerAccount::where('is_leaf', true)->where('is_active', true)->get(),
            'types' => $this->types(),
            'subTypes' => $this->subTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:subledgers,code',
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:100',
            'type' => 'required|in:deposit,loan,cash,payable,receivable',
            'sub_type' => 'required|string',
            'gl_account_id' => 'required|exists:ledger_accounts,id',
            'is_active' => 'boolean',
        ]);

        Subledger::create($validated);

        return redirect()
            ->route('subledgers.index')
            ->with('success', 'Subledger created successfully.');
    }

    public function edit(Subledger $subledger)
    {
        return Inertia::render('subledger-module/subledgers/edit-subledger-page', [
            'subledger' => $subledger,
            'glAccounts' => LedgerAccount::where('is_leaf', true)->where('is_active', true)->get(),
            'types' => $this->types(),
            'subTypes' => $this->subTypes(),
        ]);
    }

    public function show(Subledger $subledger)
    {
        return Inertia::render('subledger-module/subledgers/show-subledger-page', [
            'subledger' => $subledger->load('glAccount'),
        ]);
    }

    public function update(Request $request, Subledger $subledger)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:subledgers,code,' . $subledger->id,
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:100',
            'type' => 'required|in:deposit,loan,cash,payable,receivable',
            'sub_type' => 'required|string',
            'gl_account_id' => 'required|exists:ledger_accounts,id',
            'is_active' => 'boolean',
        ]);

        $subledger->update($validated);

        return redirect()
            ->route('subledgers.index')
            ->with('success', 'Subledger updated successfully.');
    }

    public function destroy(Subledger $subledger)
    {
        $subledger->delete();

        return redirect()
            ->back()
            ->with('success', 'Subledger deleted successfully.');
    }

    private function types()
    {
        return [
            'deposit',
            'loan',
            'cash',
            'payable',
            'receivable',
        ];
    }

    private function subTypes()
    {
        return [
            'saving deposit',
            'term deposit',
            'recurring deposit',
            'share_deposit',
            'membr_loan',
            'vehicle_loan',
            'home_loan',
            'smb_loan',
            'educational_loan',
            'agri_loan',
            'cash_at_hand',
            'cash_at_bank',
            'petty_cash',
        ];
    }
}