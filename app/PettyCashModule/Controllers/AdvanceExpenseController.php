<?php

namespace App\PettyCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\AdvanceExpense;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvanceExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = AdvanceExpense::query()
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

        return Inertia::render('petty-cash-management/advance-expenses/list-advance-expenses-page', [
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
        return Inertia::render('petty-cash-management/advance-expenses/advance-expense-form-page', [
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'petty_cash_expense_id' => 'required|exists:petty_cash_expenses,id',
            'employee_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:advance_petty_cashes,code',
        ]);

        AdvanceExpense::create($data);

        return redirect()->route('advance-petty-cashes.index')
            ->with('success', 'Advance account created');
    }

    public function edit(AdvanceExpense $advanceExpense)
    {
        return Inertia::render('petty-cash-management/advance-expenses/advance-expense-form-page', [
            'account' => $advanceExpense,
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function show(AdvanceExpense $advanceExpense)
    {
        return Inertia::render('petty-cash-management/advance-expenses/show-advance-expense-page', [
            'account' => $advanceExpense,
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, AdvanceExpense $advanceExpense)
    {
        $data = $request->validate([
            'petty_cash_expense_id' => 'required|exists:petty_cash_expenses,id',
            'employee_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'code' => "required|string|max:50|unique:advance_petty_cashes,code,{$advanceExpense->id}",
            'is_active' => 'boolean',
        ]);

        $advanceExpense->update($data);

        return redirect()->route('advance-petty-cashes.index')
            ->with('success', 'Updated successfully');
    }

    public function destroy(AdvanceExpense $advanceExpense)
    {
        $advanceExpense->delete();

        return back()->with('success', 'Deleted successfully');
    }
}