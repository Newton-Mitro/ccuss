<?php

namespace App\PettyCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAdvanceAccount;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SubledgerModule\Models\Subledger;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashAdvanceAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashAdvanceAccount::query()
            ->with(['employee', 'pettyCashAccount', 'subledgerAccount']);

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->orWhereHas(
                    'employee',
                    fn($e) =>
                    $e->where('name', 'like', "%{$search}%")
                )
                    ->orWhereHas(
                        'pettyCashAccount',
                        fn($p) =>
                        $p->where('name', 'like', "%{$search}%")
                    );
            });
        }

        // 📊 Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->latest()
            ->paginate($request->input('per_page', 18))
            ->withQueryString();

        return Inertia::render(
            'petty-cash-management/petty-cash-advance-accounts/list-petty-cash-advance-accounts-page',
            [
                'paginated_data' => $records,
                'filters' => $request->only(['search', 'status', 'per_page', 'page']),
                'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
                'employees' => User::select('id', 'name')->get(),
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-advance-accounts/petty-cash-advance-account-form-page',
            [
                'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
                'employees' => User::select('id', 'name')->get(),
            ]
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'status' => 'in:active,inactive',
        ]);

        $subledger = Subledger::where('subledger_sub_type', 'petty_cash_advances')
            ->first();

        if (!$subledger) {
            abort(403);
        }

        $employee = User::find($data['employee_id']);

        if (!$employee) {
            abort(403);
        }

        $advance = DB::transaction(function () use ($data, $request, $subledger, $employee) {

            // 1. Create advance account
            $advance = PettyCashAdvanceAccount::create([
                'petty_cash_account_id' => $data['petty_cash_account_id'],
                'employee_id' => $data['employee_id'],
                'status' => $data['status'] ?? 'active',
                'subledger_id' => $subledger->id,
            ]);

            // 2. Create central account
            $subledgerAccount = SubledgerAccount::create([
                'organization_id' => $request->user()->organization_id ?? null,
                'branch_id' => optional($advance->pettyCashAccount)->branch_id,

                'account_number' => 'PCA-' . str_pad($advance->id, 5, '0', STR_PAD_LEFT),
                'name' => $employee->name . ' - Advance Petty Cash',

                'status' => 'active',

                // polymorphic link
                'accountable_type' => PettyCashAdvanceAccount::class,
                'accountable_id' => $advance->id,
                'subledger_id' => $subledger->id,
            ]);

            // 3. Optional reverse link
            $advance->update([
                'subledger_account_id' => $subledgerAccount->id,
            ]);

            return $advance;
        });

        return redirect()
            ->route('petty-cash-advance-accounts.index')
            ->with('success', $advance->name . ' Employee Petty Cash Account created successfully');
    }

    public function edit(PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-advance-accounts/petty-cash-advance-account-form-page',
            [
                'pettyCashAdvanceAccount' => $pettyCashAdvanceAccount->load(['employee', 'pettyCashAccount', 'subledgerAccount']),
                'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
                'employees' => User::select('id', 'name')->get(),
            ]
        );
    }

    public function show(PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-advance-accounts/show-petty-cash-advance-account-page',
            [
                'pettyCashAdvanceAccount' => $pettyCashAdvanceAccount->load(['employee', 'pettyCashAccount', 'subledgerAccount']),
            ]
        );
    }

    public function update(Request $request, PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'account_number' => "required|string|unique:subledger_accounts,account_number,{$pettyCashAdvanceAccount->subledger_account_id}",

            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'status' => 'in:active,inactive',
        ]);

        $advance = DB::transaction(function () use ($data, $pettyCashAdvanceAccount) {

            $pettyCashAdvanceAccount->update([
                'petty_cash_account_id' => $data['petty_cash_account_id'],
                'employee_id' => $data['employee_id'],
                'status' => $data['status'] ?? 'active',
            ]);

            $pettyCashAdvanceAccount->account?->update([
                'name' => ($data['name'] ?? 'Advance - Employee') . ' (Advance)',
                'account_number' => $data['account_number'],
            ]);

            return $pettyCashAdvanceAccount;
        });

        return redirect()
            ->route('petty-cash-advance-accounts.index')
            ->with('success', $advance->name . ' Employee Petty Cash Account updated successfully');
    }

    public function destroy(PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        $advance = DB::transaction(function () use ($pettyCashAdvanceAccount) {
            $pettyCashAdvanceAccount->subledgerAccount?->delete();
            $pettyCashAdvanceAccount->delete();
            return $pettyCashAdvanceAccount;
        });

        return back()->with('success', $advance->name . ' Employee Petty Cash Account deleted successfully');
    }

    public function createPettyCashAdvanceEntry()
    {
        return Inertia::render('petty-cash-management/petty-cash-transactions/petty-cash-advance-entry-page', [
            'pettyCashAccounts' => PettyCashAccount::all(),
            'employees' => User::select('id', 'name')->get(),
        ]);
    }

    public function createPettyCashAdvanceReturn()
    {
        $advances = Advance::where('remaining_amount', '>', 0)
            ->with('employee')
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'employee_name' => $a->employee->name,
                    'amount' => $a->amount,
                    'remaining_amount' => $a->remaining_amount,
                ];
            });

        return inertia('AdvanceReturns/Create', [
            'advances' => $advances,
        ]);
    }

}