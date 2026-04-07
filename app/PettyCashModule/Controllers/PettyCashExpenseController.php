<?php

namespace App\PettyCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashExpense;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashExpense::query()
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
            'petty-cash-management/petty-cash-expenses/list-petty-cash-expenses-page',
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
        return Inertia::render('petty-cash-management/petty-cash-expenses/petty-cash-expense-form-page', [
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:petty_cash_expenses,code',
            'branch_id' => 'required|exists:branches,id',
            'custodian_id' => 'nullable|exists:users,id',
            'imprest_amount' => 'nullable|numeric|min:0',
        ]);

        $data['balance'] = $data['imprest_amount'] ?? 0;

        PettyCashExpense::create($data);

        return redirect()->route('petty-cash-expenses.index')
            ->with('success', 'Petty Cash Expense created successfully');
    }

    public function edit(PettyCashExpense $pettyCashExpense)
    {
        return Inertia::render('petty-cash-management/petty-cash-expenses/petty-cash-expense-form-page', [
            'pettyCash' => $pettyCashExpense,
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function show(PettyCashExpense $pettyCashExpense)
    {
        return Inertia::render('petty-cash-management/petty-cash-expenses/show-petty-cash-expense-page', [
            'pettyCash' => $pettyCashExpense,
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, PettyCashExpense $pettyCashExpense)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => "required|string|max:50|unique:petty_cash_expenses,code,{$pettyCashExpense->id}",
            'branch_id' => 'required|exists:branches,id',
            'custodian_id' => 'nullable|exists:users,id',
            'imprest_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $pettyCashExpense->update($data);

        return redirect()->route('petty-cash-expenses.index')
            ->with('success', 'Updated successfully');
    }

    public function destroy(PettyCashExpense $pettyCashExpense)
    {
        $pettyCashExpense->delete();

        return back()->with('success', 'Deleted successfully');
    }
}