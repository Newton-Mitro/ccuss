<?php

namespace App\PettyCashModule\Controllers;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SystemAdministration\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashAccount::query()
            ->with(['branch', 'ledgerAccount']);

        // 🔍 Search (name + branch)
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas(
                        'branch',
                        fn($b) =>
                        $b->where('name', 'like', "%{$search}%")
                    );
            });
        }

        // 🏢 Branch filter
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // 📊 Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $accounts = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/list-petty-cash-accounts-page',
            [
                'accounts' => $accounts,
                'filters' => $request->only(['search', 'branch_id', 'status', 'per_page', 'page']),
                'branches' => Branch::select('id', 'name')->get(),
                'ledgerAccounts' => LedgerAccount::select('id', 'name')->get(),
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/petty-cash-account-form-page',
            [
                'branches' => Branch::select('id', 'name')->get(),
                'ledgerAccounts' => LedgerAccount::select('id', 'name')->get(),
            ]
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'ledger_account_id' => 'required|exists:ledger_accounts,id',
            'upper_limit' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        PettyCashAccount::create($data);

        return redirect()
            ->route('petty-cash-accounts.index')
            ->with('success', 'Petty Cash Account created successfully');
    }

    public function edit(PettyCashAccount $pettyCashAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/petty-cash-account-form-page',
            [
                'pettyCash' => $pettyCashAccount->load(['branch', 'ledgerAccount']),
                'branches' => Branch::select('id', 'name')->get(),
                'ledgerAccounts' => LedgerAccount::select('id', 'name')->get(),
            ]
        );
    }

    public function show(PettyCashAccount $pettyCashAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/show-petty-cash-account-page',
            [
                'pettyCash' => $pettyCashAccount->load(['branch', 'ledgerAccount']),
            ]
        );
    }

    public function update(Request $request, PettyCashAccount $pettyCashAccount)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'ledger_account_id' => 'required|exists:ledger_accounts,id',
            'upper_limit' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        $pettyCashAccount->update($data);

        return redirect()
            ->route('petty-cash-accounts.index')
            ->with('success', 'Updated successfully');
    }

    public function destroy(PettyCashAccount $pettyCashAccount)
    {
        $pettyCashAccount->delete();

        return back()->with('success', 'Deleted successfully');
    }
}