<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LedgerAccountController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Search Ledger Accounts
    |--------------------------------------------------------------------------
    */
    public function ledgerSearch(Request $request)
    {
        $search = trim($request->input('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->whereNotNull('parent_id') // only leaf-level usable accounts
            ->where('is_group', false)
            ->where('is_active', true)
            ->where('is_control_account', false)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->limit(20)
            ->get();

        return response()->json($ledgers);
    }

    /*
    |--------------------------------------------------------------------------
    | Cash Ledger List
    |--------------------------------------------------------------------------
    */
    public function cashLedgerList()
    {
        // Better: use subledger_type instead of name
        $cashControl = LedgerAccount::query()
            ->where('subledger_type', 'cash')
            ->where('is_control_account', true)
            ->where('is_active', true)
            ->first();

        if (!$cashControl) {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->where('parent_id', $cashControl->id)
            ->where('is_active', true)
            ->where('is_group', false)
            ->orderBy('code')
            ->get();

        return response()->json($ledgers);
    }

    /*
    |--------------------------------------------------------------------------
    | Chart of Accounts
    |--------------------------------------------------------------------------
    */
    public function index(Request $request): Response
    {
        $glAccounts = LedgerAccount::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with('childrenRecursive') // ✅ clean recursion
            ->orderBy('code')
            ->get();

        return Inertia::render('general-accounting/chart-of-accounts/index', [
            'glAccounts' => $glAccounts,
        ]);
    }

    public function create(): Response
    {
        $parents = LedgerAccount::query()
            ->where('is_group', true)
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'name', 'code']);

        return Inertia::render('general-accounting/chart-of-accounts/create-ledger-account-page', [
            'parents' => $parents,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'organization_id' => ['required', 'exists:organizations,id'],
            'code' => ['required', 'string', 'max:50', 'unique:ledger_accounts,code'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:asset,liability,equity,income,expense'],
            'description' => ['nullable', 'string'],
            'is_group' => ['required', 'boolean'],
            'is_control_account' => ['required', 'boolean'],
            'subledger_type' => ['nullable', 'string', 'max:150'],
            'subledger_sub_type' => ['nullable', 'string', 'max:150'],
            'parent_id' => ['nullable', 'exists:ledger_accounts,id'],
        ]);

        // 🔒 Business Rule Enforcement
        if ($data['is_group']) {
            $data['is_control_account'] = false;
            $data['subledger_type'] = null;
            $data['subledger_sub_type'] = null;
        }

        DB::transaction(function () use ($data) {
            LedgerAccount::create($data);
        });

        return redirect()
            ->route('ledger-accounts.index')
            ->with('success', 'Ledger account created successfully.');
    }

    public function show(LedgerAccount $ledgerAccount): Response
    {
        $ledgerAccount->load('parent', 'children');

        return Inertia::render('general-accounting/chart-of-accounts/show-ledger-account-page', [
            'ledger' => $ledgerAccount,
        ]);
    }

    public function edit(LedgerAccount $ledgerAccount): Response
    {
        $parents = LedgerAccount::query()
            ->where('is_group', true)
            ->where('id', '!=', $ledgerAccount->id) // prevent self-parenting
            ->orderBy('code')
            ->get(['id', 'name', 'code']);

        return Inertia::render('general-accounting/chart-of-accounts/edit-ledger-account-page', [
            'ledger' => $ledgerAccount,
            'parents' => $parents,
        ]);
    }

    public function update(Request $request, LedgerAccount $ledgerAccount)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', "unique:ledger_accounts,code,{$ledgerAccount->id}"],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:asset,liability,equity,income,expense'],
            'description' => ['nullable', 'string'],
            'is_group' => ['required', 'boolean'],
            'is_control_account' => ['required', 'boolean'],
            'subledger_type' => ['nullable', 'string', 'max:150'],
            'subledger_sub_type' => ['nullable', 'string', 'max:150'],
            'parent_id' => ['nullable', 'exists:ledger_accounts,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        // 🔒 Prevent invalid hierarchy
        if ($data['parent_id'] == $ledgerAccount->id) {
            return back()->withErrors(['parent_id' => 'Account cannot be its own parent.']);
        }

        // 🔒 Business rules
        if ($data['is_group']) {
            $data['is_control_account'] = false;
            $data['subledger_type'] = null;
            $data['subledger_sub_type'] = null;
        }

        DB::transaction(function () use ($ledgerAccount, $data) {
            $ledgerAccount->update($data);
        });

        return redirect()
            ->route('ledger-accounts.index')
            ->with('success', 'Ledger account updated successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Ledger Account
    |--------------------------------------------------------------------------
    */
    public function destroy(LedgerAccount $ledgerAccount)
    {
        // ❌ Prevent deleting group accounts with children
        if ($ledgerAccount->children()->exists()) {
            return back()->with('error', 'Cannot delete account with children.');
        }

        // ❌ (Optional but recommended)
        // Prevent deleting if transactions exist
        if (
            method_exists($ledgerAccount, 'transactions') &&
            $ledgerAccount->transactions()->exists()
        ) {
            return back()->with('error', 'Cannot delete account with transactions.');
        }

        DB::transaction(function () use ($ledgerAccount) {
            $ledgerAccount->delete();
        });

        return back()->with(
            'success',
            "{$ledgerAccount->code} - {$ledgerAccount->name} deleted successfully."
        );
    }
}