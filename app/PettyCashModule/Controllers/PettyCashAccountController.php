<?php

namespace App\PettyCashModule\Controllers;

use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SubledgerModule\Models\Subledger;
use App\SubledgerModule\Models\SubledgerAccount;
use Illuminate\Support\Facades\DB;
use App\SystemAdministration\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashAccount::query()
            ->with(['branch', 'subledgerAccount']);

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
            ->paginate($request->input('per_page', 18))
            ->withQueryString();

        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/list-petty-cash-accounts-page',
            [
                'accounts' => $accounts,
                'filters' => $request->only(['search', 'branch_id', 'status', 'per_page', 'page']),
                'branches' => Branch::select('id', 'name')->get(),
            ]
        );
    }

    public function create()
    {
        $authUserBranch = auth()->user()->branch;
        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/petty-cash-account-form-page',
            [
                'userBranch' => $authUserBranch,
                'branches' => Branch::select('id', 'name')->get(),
            ]
        );
    }

    public function store(Request $request)
    {
        $organizationId = $request->user()->organization_id;
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'upper_limit' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        $subledger = Subledger::where('subledger_sub_type', 'petty_cashes')
            ->first();

        if (!$subledger) {
            abort(403);
        }

        $pettyCash = DB::transaction(function () use ($data, $organizationId, $subledger) {

            // 1. Create petty cash account
            $pettyCash = PettyCashAccount::create([
                'branch_id' => $data['branch_id'],
                'name' => $data['name'] ?? 'Petty Cash',
                'upper_limit' => $data['upper_limit'],
                'status' => $data['status'] ?? 'active',
                'subledger_id' => $subledger->id,
            ]);

            // 2. Create central account (IMPORTANT)
            $account = SubledgerAccount::create([
                'organization_id' => $organizationId ?? null,
                'branch_id' => $data['branch_id'],
                'account_number' => 'PC-' . str_pad($pettyCash->id, 5, '0', STR_PAD_LEFT),
                'name' => ($data['name'] ?? 'Petty Cash'),
                'status' => 'active',

                // polymorphic link
                'accountable_type' => PettyCashAccount::class,
                'accountable_id' => $pettyCash->id,
                'subledger_id' => $subledger->id,
            ]);

            // 3. Optional reverse link (if needed)
            $pettyCash->update([
                'subledger_account_id' => $account->id,
            ]);

            return $pettyCash;
        });

        return redirect()
            ->route('petty-cash-accounts.index')
            ->with('success', $pettyCash->name . ' Petty Cash Account created successfully');
    }

    public function edit(PettyCashAccount $pettyCashAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/petty-cash-account-form-page',
            [
                'pettyCash' => $pettyCashAccount->load(['branch', 'subledgerAccount']),
                'branches' => Branch::select('id', 'name')->get(),
            ]
        );
    }

    public function show(PettyCashAccount $pettyCashAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/show-petty-cash-account-page',
            [
                'pettyCash' => $pettyCashAccount->load(['branch', 'subledgerAccount']),
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
        ]);

        DB::transaction(function () use ($data, $pettyCashAccount) {
            $pettyCashAccount->update([
                'name' => $data['name'] ?? 'Petty Cash',
                'branch_id' => $data['branch_id'],
                'upper_limit' => $data['upper_limit'],
                'status' => $data['status'] ?? 'active',
            ]);

            $pettyCashAccount->account?->update([
                'name' => ($data['name'] ?? 'Petty Cash'),
            ]);
        });

        return redirect()
            ->route('petty-cash-accounts.index')
            ->with('success', $pettyCashAccount->name . ' Petty Cash Account updated successfully');
    }

    public function destroy(PettyCashAccount $pettyCashAccount)
    {
        DB::transaction(function () use ($pettyCashAccount) {
            $pettyCashAccount->account?->delete();
            $pettyCashAccount->delete();
        });

        return back()->with('success', $pettyCashAccount->name . ' Petty Cash Account deleted successfully');
    }

    public function createPettyCashReplenishment()
    {
        return Inertia::render('petty-cash-management/petty-cash-transactions/petty-cash-replenishment-page', [
            'pettyCashAccounts' => PettyCashAccount::all(),
            'fundingAccounts' => LedgerAccount::where('is_control_account', true)->where('is_active', true)->get(),
        ]);
    }

    public function createPettyCashExpense()
    {
        return Inertia::render('petty-cash-management/petty-cash-transactions/petty-cash-expense-entry-page', [
            'pettyCashAccounts' => PettyCashAccount::all(),
            'expenseLedgers' => LedgerAccount::where('type', 'expense')->get(),
        ]);
    }
}