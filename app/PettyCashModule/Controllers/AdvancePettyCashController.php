<?php

namespace App\PettyCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\AdvancePettyCash;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvancePettyCashController extends Controller
{
    public function index(Request $request)
    {
        $query = AdvancePettyCash::query()
            ->with(['employee', 'pettyCashAccount', 'branch']);

        // 🔍 Search (name, code, employee, petty cash account, branch)
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('employee', function ($e) use ($search) {
                        $e->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('pettyCashAccount', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('branch', function ($b) use ($search) {
                        $b->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // 🏢 Branch filter
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // 📊 Status filter (Active / Inactive)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status);
        }

        // 📦 Pagination
        $accounts = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('petty-cash-management/advance-petty-cash-accounts/list-advance-petty-cash-accounts-page', [
            'accounts' => $accounts,
            'filters' => $request->only([
                'search',
                'branch_id',
                'status',
                'per_page',
                'page',
            ]),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('PettyCash/AdvanceAccounts/Create', [
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:advance_petty_cashes,code',
        ]);

        AdvancePettyCash::create($data);

        return redirect()->route('advance-petty-cashes.index')
            ->with('success', 'Advance account created');
    }

    public function edit(AdvancePettyCash $advancePettyCash)
    {
        return Inertia::render('PettyCash/AdvanceAccounts/Edit', [
            'account' => $advancePettyCash,
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, AdvancePettyCash $advancePettyCash)
    {
        $data = $request->validate([
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'code' => "required|string|max:50|unique:advance_petty_cashes,code,{$advancePettyCash->id}",
            'is_active' => 'boolean',
        ]);

        $advancePettyCash->update($data);

        return redirect()->route('advance-petty-cashes.index')
            ->with('success', 'Updated successfully');
    }

    public function destroy(AdvancePettyCash $advancePettyCash)
    {
        $advancePettyCash->delete();

        return back()->with('success', 'Deleted successfully');
    }
}