<?php

namespace App\PettyCashModule\Controllers;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\PettyCashModule\Models\PettyCashAdvanceAccount;
use App\PettyCashModule\Models\PettyCashAccount;
use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PettyCashAdvanceAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCashAdvanceAccount::query()
            ->with(['employee', 'pettyCashAccount', 'ledgerAccount']);

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
            ->paginate($request->input('per_page', 10))
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

            // advance layer
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'status' => 'in:active,inactive',
        ]);

        DB::transaction(function () use ($data) {

            // 1. Create advance account
            $advance = PettyCashAdvanceAccount::create([
                'petty_cash_account_id' => $data['petty_cash_account_id'],
                'employee_id' => $data['employee_id'],
                'status' => $data['status'] ?? 'active',
            ]);

            // 2. Create central account
            $account = Account::create([
                'organization_id' => $data['organization_id'] ?? null,
                'branch_id' => optional($advance->pettyCashAccount)->branch_id,

                'account_number' => $data['account_number'],
                'name' => ($data['name'] ?? 'Advance - Employee') . ' (Advance)',

                'type' => 'employee_advance', // 🔥 important
                'balance' => 0,
                'status' => 'active',

                // polymorphic link
                'accountable_type' => PettyCashAdvanceAccount::class,
                'accountable_id' => $advance->id,
            ]);

            // 3. Optional reverse link
            $advance->update([
                'account_id' => $account->id,
            ]);
        });

        return redirect()
            ->route('petty-cash-advance-accounts.index')
            ->with('success', 'Employee Petty Cash Account created successfully');
    }

    public function edit(PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-advance-accounts/petty-cash-advance-account-form-page',
            [
                'account' => $pettyCashAdvanceAccount->load(['employee', 'pettyCashAccount', 'ledgerAccount']),
                'pettyCashAccounts' => PettyCashAccount::select('id', 'name')->get(),
                'employees' => User::select('id', 'name')->get(),
                'ledgerAccounts' => LedgerAccount::select('id', 'name')->get(),
            ]
        );
    }

    public function show(PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        return Inertia::render(
            'petty-cash-management/petty-cash-advance-accounts/show-petty-cash-advance-account-page',
            [
                'account' => $pettyCashAdvanceAccount->load(['employee', 'pettyCashAccount', 'ledgerAccount']),
            ]
        );
    }

    public function update(Request $request, PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'account_number' => "required|string|unique:accounts,account_number,{$pettyCashAdvanceAccount->account_id}",

            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'employee_id' => 'required|exists:users,id',
            'status' => 'in:active,inactive',
        ]);

        DB::transaction(function () use ($data, $pettyCashAdvanceAccount) {

            $pettyCashAdvanceAccount->update([
                'petty_cash_account_id' => $data['petty_cash_account_id'],
                'employee_id' => $data['employee_id'],
                'status' => $data['status'] ?? 'active',
            ]);

            $pettyCashAdvanceAccount->account?->update([
                'name' => ($data['name'] ?? 'Advance - Employee') . ' (Advance)',
                'account_number' => $data['account_number'],
            ]);
        });

        return redirect()
            ->route('petty-cash-advance-accounts.index')
            ->with('success', 'Employee Petty Cash Account updated successfully');
    }

    public function destroy(PettyCashAdvanceAccount $pettyCashAdvanceAccount)
    {
        DB::transaction(function () use ($pettyCashAdvanceAccount) {
            $pettyCashAdvanceAccount->account?->delete();
            $pettyCashAdvanceAccount->delete();
        });

        return back()->with('success', 'Deleted successfully');
    }
}