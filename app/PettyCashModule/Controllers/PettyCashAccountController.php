<?php

namespace App\PettyCashModule\Controllers;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SubledgerModule\Models\Account;
use Illuminate\Support\Facades\DB;
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
            // account layer
            'name' => 'nullable|string|max:255',
            'account_number' => 'required|string|unique:accounts,account_number',

            'organization_id' => 'nullable|exists:organizations,id',
            'branch_id' => 'required|exists:branches,id',

            // petty cash layer
            'upper_limit' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        DB::transaction(function () use ($data) {

            // 1. Create petty cash account
            $pettyCash = PettyCashAccount::create([
                'branch_id' => $data['branch_id'],
                'name' => $data['name'] ?? 'Petty Cash',
                'upper_limit' => $data['upper_limit'],
                'status' => $data['status'] ?? 'active',
            ]);

            // 2. Create central account (IMPORTANT)
            $account = Account::create([
                'organization_id' => $data['organization_id'] ?? null,
                'branch_id' => $data['branch_id'],
                'account_number' => $data['account_number'],
                'name' => ($data['name'] ?? 'Petty Cash') . ' (Petty Cash)',
                'type' => 'petty_cash',
                'balance' => 0,
                'status' => 'active',

                // polymorphic link
                'accountable_type' => PettyCashAccount::class,
                'accountable_id' => $pettyCash->id,
            ]);

            // 3. Optional reverse link (if needed)
            $pettyCash->update([
                'account_id' => $account->id,
            ]);
        });

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
            'name' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'upper_limit' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
            'account_number' => "required|string|unique:accounts,account_number,{$pettyCashAccount->account_id}",
        ]);

        DB::transaction(function () use ($data, $pettyCashAccount) {

            $pettyCashAccount->update([
                'name' => $data['name'] ?? 'Petty Cash',
                'branch_id' => $data['branch_id'],
                'upper_limit' => $data['upper_limit'],
                'status' => $data['status'] ?? 'active',
            ]);

            $pettyCashAccount->account?->update([
                'name' => ($data['name'] ?? 'Petty Cash') . ' (Petty Cash)',
                'account_number' => $data['account_number'],
            ]);
        });

        return redirect()
            ->route('petty-cash-accounts.index')
            ->with('success', 'Updated successfully');
    }

    public function destroy(PettyCashAccount $pettyCashAccount)
    {
        DB::transaction(function () use ($pettyCashAccount) {
            $pettyCashAccount->account?->delete();
            $pettyCashAccount->delete();
        });

        return back()->with('success', 'Deleted successfully');
    }
}