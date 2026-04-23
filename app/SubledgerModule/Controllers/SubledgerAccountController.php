<?php

namespace App\SubledgerModule\Controllers;

use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\Subledger;
use App\SubledgerModule\Models\SubledgerAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubledgerAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SubledgerAccount::with([
            'subledger',
            'accountable'
        ]);

        // 🔍 Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('account_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // 🎯 Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // 🎯 Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // 🏢 Branch filter
        if ($branchId = $request->input('branch_id')) {
            $query->where('branch_id', $branchId);
        }

        $accounts = $query
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('subledger-module/subledger-accounts/list-subledger-accounts-page', [
            'accounts' => $accounts,
            'filters' => $request->only([
                'search',
                'type',
                'status',
                'branch_id',
                'per_page',
                'page',
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('subledger-module/subledger-accounts/create', [
            'subledgers' => Subledger::select('id', 'name')->get(),

            'types' => [
                'bank',
                'deposit',
                'loan',
                'petty_cash',
                'petty_cash_advance',
                'vendor',
                'vault',
                'teller',
                'customer',
            ],

            'statuses' => [
                'pending',
                'active',
                'dormant',
                'frozen',
                'closed',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_number' => 'required|string|unique:subledger_accounts,account_number',
            'name' => 'nullable|string|max:255',
            'type' => 'required|string',
            'status' => 'required|string',
            'accountable_type' => 'required|string',
            'accountable_id' => 'required|integer',
            'subledger_id' => 'nullable|exists:subledgers,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $subledgerAccount = SubledgerAccount::create($validated);

        return redirect()
            ->route('subledger-accounts.index')
            ->with('success', $subledgerAccount->name . ' Account created successfully.');
    }

    public function show(SubledgerAccount $subledgerAccount): Response
    {
        $subledgerAccount->load([
            'subledger',
            'accountable'
        ]);

        return Inertia::render('subledger-module/subledger-accounts/show-subledger-account-page', [
            'account' => $subledgerAccount,
        ]);
    }

    public function edit(SubledgerAccount $subledgerAccount): Response
    {
        return Inertia::render('subledger-module/subledger-accounts/edit-subledger-account-page', [
            'account' => $subledgerAccount,
            'subledgers' => Subledger::select('id', 'name')->get(),

            'types' => [
                'bank',
                'deposit',
                'loan',
                'petty_cash',
                'petty_cash_advance',
                'vendor',
                'vault',
                'teller',
                'customer',
            ],

            'statuses' => [
                'pending',
                'active',
                'dormant',
                'frozen',
                'closed',
            ],
        ]);
    }

    public function update(Request $request, SubledgerAccount $subledgerAccount)
    {
        $validated = $request->validate([
            'account_number' => 'required|string|unique:subledger_accounts,account_number,' . $subledgerAccount->id,
            'name' => 'nullable|string|max:255',
            'type' => 'required|string',
            'status' => 'required|string',
            'accountable_type' => 'required|string',
            'accountable_id' => 'required|integer',
            'subledger_id' => 'nullable|exists:subledgers,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $subledgerAccount->update($validated);

        return redirect()
            ->route('subledger-accounts.index')
            ->with('success', $subledgerAccount->name . ' Account updated successfully.');
    }

    public function destroy(SubledgerAccount $subledgerAccount)
    {
        $subledgerAccount->delete();

        return redirect()
            ->back()
            ->with('success', $subledgerAccount->name . ' Account deleted successfully.');
    }
}