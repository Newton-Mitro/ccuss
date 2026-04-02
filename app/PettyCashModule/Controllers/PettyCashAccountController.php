<?php

namespace App\PettyCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashAccount::query()
            ->with(['branch', 'custodian']);

        // 🔍 Search (name, code, branch, custodian)
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('branch', function ($b) use ($search) {
                        $b->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('custodian', function ($c) use ($search) {
                        $c->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // 🏢 Branch Filter
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // 📊 Status Filter (Active / Inactive)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status);
        }

        // 📦 Pagination
        $accounts = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render(
            'petty-cash-management/petty-cash-accounts/list-petty-cash-accounts-page',
            [
                'accounts' => $accounts,
                'filters' => $request->only([
                    'search',
                    'branch_id',
                    'status',
                    'per_page',
                    'page',
                ]),
                'branches' => Branch::select('id', 'name')->get(),
            ]
        );
    }

    public function create()
    {
        return Inertia::render('petty-cash-management/petty-cash-accounts/petty-cash-form-page', [
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:petty_cash_accounts,code',
            'branch_id' => 'required|exists:branches,id',
            'custodian_id' => 'nullable|exists:users,id',
            'imprest_amount' => 'nullable|numeric|min:0',
        ]);

        $data['balance'] = $data['imprest_amount'] ?? 0;

        PettyCashAccount::create($data);

        return redirect()->route('petty-cash-accounts.index')
            ->with('success', 'Petty Cash Account created successfully');
    }

    public function edit(PettyCashAccount $pettyCashAccount)
    {
        return Inertia::render('petty-cash-management/petty-cash-accounts/petty-cash-form-page', [
            'pettyCash' => $pettyCashAccount,
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function show(PettyCashAccount $pettyCashAccount)
    {
        return Inertia::render('petty-cash-management/petty-cash-accounts/show-petty-cash-page', [
            'pettyCash' => $pettyCashAccount,
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, PettyCashAccount $pettyCashAccount)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => "required|string|max:50|unique:petty_cash_accounts,code,{$pettyCashAccount->id}",
            'branch_id' => 'required|exists:branches,id',
            'custodian_id' => 'nullable|exists:users,id',
            'imprest_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $pettyCashAccount->update($data);

        return redirect()->route('petty-cash-accounts.index')
            ->with('success', 'Updated successfully');
    }

    public function destroy(PettyCashAccount $pettyCashAccount)
    {
        $pettyCashAccount->delete();

        return back()->with('success', 'Deleted successfully');
    }
}