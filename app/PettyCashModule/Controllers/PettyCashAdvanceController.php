<?php

namespace App\PettyCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAccount;
use App\PettyCashModule\Models\PettyCashAdvance;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashAdvanceController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashAdvance::query()
            ->with(['employee', 'pettyCashAccount', 'approver']);

        // 🔍 Search by employee or petty cash account
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->orWhereHas('employee', fn($e) => $e->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('pettyCashAccount', fn($p) => $p->where('name', 'like', "%{$search}%"));
            });
        }

        // 📊 Status filter (pending/approved/settled/rejected)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 📦 Pagination
        $pettyCashAdvances = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('petty-cash-management/petty-cash-advances/list-petty-cash-advances-page', [
            'paginated_data' => $pettyCashAdvances,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('petty-cash-management/petty-cash-advances/petty-cash-advance-form-page', [
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'advance_date' => 'required|date',
            'purpose' => 'nullable|string|max:255',
            'status' => 'in:pending,approved,settled,rejected',
            'approved_by' => 'nullable|exists:users,id',
            'settled_at' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        PettyCashAdvance::create($data);

        return redirect()->route('petty-cash-advances.index')
            ->with('success', 'Petty Cash Advance created successfully');
    }

    public function edit(PettyCashAdvance $pettyCashAdvance)
    {
        return Inertia::render('petty-cash-management/petty-cash-advances/petty-cash-advance-form-page', [
            'advance' => $pettyCashAdvance,
            'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
            'employees' => User::select('id', 'name')->get(),
        ]);
    }

    public function show(PettyCashAdvance $pettyCashAdvance)
    {
        $pettyCashAdvance->load('employee', 'pettyCashAccount', 'approver');
        return Inertia::render('petty-cash-management/petty-cash-advances/show-petty-cash-advance-page', [
            'advance' => $pettyCashAdvance,
        ]);
    }

    public function update(Request $request, PettyCashAdvance $pettyCashAdvance)
    {
        $data = $request->validate([
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'advance_date' => 'required|date',
            'purpose' => 'nullable|string|max:255',
            'status' => 'in:pending,approved,settled,rejected',
            'approved_by' => 'nullable|exists:users,id',
            'settled_at' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        $pettyCashAdvance->update($data);

        return redirect()->route('petty-cash-advances.index')
            ->with('success', 'Petty Cash Advance updated successfully');
    }

    public function destroy(PettyCashAdvance $pettyCashAdvance)
    {
        $pettyCashAdvance->delete();

        return back()->with('success', 'Deleted successfully');
    }
}