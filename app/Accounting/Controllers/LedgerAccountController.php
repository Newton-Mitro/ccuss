<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LedgerAccountController extends Controller
{
    public function ledgerSearch(Request $request)
    {
        $search = trim($request->input('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->whereNotNull('parent_id')        // parent not null
            ->where('is_active', true)          // active only
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->limit(20)
            ->get();

        return response()->json($ledgers);
    }

    public function index(): Response
    {
        $glAccounts = LedgerAccount::with('childrenRecursive')
            ->whereNull('parent_id')
            ->orderBy('code')
            ->get();

        $groupAccounts = LedgerAccount::where('is_control_account', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('accounting/ledger-accounts/index', [
            'glAccounts' => $glAccounts,
            'groupAccounts' => $groupAccounts,
            'flash' => session()->all(),
        ]);
    }



    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:ledger_accounts,code',
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => 'nullable|exists:ledger_accounts,id',
        ]);

        $account = LedgerAccount::create([
            ...$data,
            'is_leaf' => empty($data['is_control_account']),
        ]);

        // If parent exists → mark parent as non-leaf
        if ($account->parent_id) {
            LedgerAccount::where('id', $account->parent_id)
                ->update(['is_leaf' => false]);
        }

        return back()->with('success', 'Account created successfully.');
    }

    public function move(Request $request)
    {
        $data = $request->validate([
            'ledger_account_id' => 'required|exists:ledger_accounts,id',
            'parent_id' => 'required|exists:ledger_accounts,id',
        ]);

        LedgerAccount::where('id', $data['ledger_account_id'])
            ->update(['parent_id' => $data['parent_id']]);

        // Parent is no longer leaf
        LedgerAccount::where('id', $data['parent_id'])
            ->update(['is_leaf' => false]);

        return back()->with('success', 'Account moved successfully.');
    }

    public function update(Request $request, LedgerAccount $ledgerAccount)
    {
        $rules = [
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => 'nullable|exists:ledger_accounts,id',
        ];

        if ($request->code !== $ledgerAccount->code) {
            $rules['code'] = [
                'required',
                'string',
                'max:50',
                Rule::unique('ledger_accounts', 'code')->ignore($ledgerAccount->id),
            ];
        } else {
            $rules['code'] = 'required|string|max:50';
        }

        $data = $request->validate($rules);

        $ledgerAccount->update($data);

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(LedgerAccount $ledgerAccount)
    {
        if ($ledgerAccount->children()->exists()) {
            return back()->with('error', 'Cannot delete account with children.');
        }

        $parent = $ledgerAccount->parent;
        $ledgerAccount->delete();

        if ($parent && $parent->children()->count() === 0) {
            $parent->update(['is_leaf' => true]);
        }

        return back()->with('success', 'Account deleted successfully.');
    }
}
