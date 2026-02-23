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
    /**
     * AJAX search for ledger accounts
     */
    public function ledgerSearch(Request $request)
    {
        $search = trim($request->input('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->whereNotNull('parent_id')           // only leaf or sub-accounts
            ->where('is_active', true)            // only active accounts
            ->where('is_control_account', false)  // exclude control accounts
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('code')
            ->limit(20)
            ->get();

        return response()->json($ledgers);
    }

    public function cashLedgerList()
    {
        // Find Cash control account
        $cashControl = LedgerAccount::where('name', 'Cash')
            ->where('is_control_account', true)
            ->where('is_active', true)
            ->first();

        if (!$cashControl) {
            return response()->json([]);
        }

        $ledgers = LedgerAccount::query()
            ->where('parent_id', $cashControl->id)   // only Cash children
            ->where('is_active', true)
            ->where('is_control_account', false)
            ->orderBy('code')
            ->get();

        return response()->json($ledgers);
    }

    /**
     * Index page
     */
    public function index(): Response
    {
        $glAccounts = LedgerAccount::query()
            ->whereNull('parent_id')
            ->with('childrenRecursive')
            ->orderBy('code')
            ->get();

        $groupAccounts = LedgerAccount::query()
            ->where('is_control_account', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return Inertia::render('accounting/ledger-accounts/index', [
            'glAccounts' => $glAccounts,
            'groupAccounts' => $groupAccounts,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Create new ledger account
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:ledger_accounts,code',
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => 'nullable|exists:ledger_accounts,id',
        ]);

        // Prevent setting a parent on a control account
        if (!empty($data['is_control_account']) && !empty($data['parent_id'])) {
            return back()->with('error', 'Control accounts cannot have a parent.');
        }

        $account = LedgerAccount::create([
            ...$data,
            'is_leaf' => empty($data['is_control_account']),
        ]);

        // Update parent's leaf status
        if ($account->parent_id) {
            LedgerAccount::where('id', $account->parent_id)->update(['is_leaf' => false]);
        }

        return back()->with('success', 'Account created successfully.');
    }

    /**
     * Update existing ledger account
     */
    public function update(Request $request, LedgerAccount $ledgerAccount)
    {
        $rules = [
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => [
                'nullable',
                'exists:ledger_accounts,id',
                function ($attribute, $value, $fail) use ($ledgerAccount) {
                    if ($value == $ledgerAccount->id) {
                        $fail('Parent account cannot be self.');
                    }
                }
            ],
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

        // Prevent parent on control account
        if (!empty($data['is_control_account']) && !empty($data['parent_id'])) {
            return back()->with('error', 'Control accounts cannot have a parent.');
        }

        $ledgerAccount->update($data);

        // Update leaf status for parent accounts
        if ($ledgerAccount->parent_id) {
            LedgerAccount::where('id', $ledgerAccount->parent_id)->update(['is_leaf' => false]);
        }
        if ($ledgerAccount->children()->count() === 0 && !$ledgerAccount->is_control_account) {
            $ledgerAccount->update(['is_leaf' => true]);
        }

        return back()->with('success', 'Account updated successfully.');
    }

    /**
     * Delete ledger account
     */
    public function destroy(LedgerAccount $ledgerAccount)
    {
        if ($ledgerAccount->children()->exists()) {
            return back()->with('error', 'Cannot delete account with children.');
        }

        $parent = $ledgerAccount->parent;
        $ledgerAccount->delete();

        // If parent has no more children, mark it as leaf
        if ($parent && $parent->children()->count() === 0) {
            $parent->update(['is_leaf' => true]);
        }

        return back()->with('success', 'Account deleted successfully.');
    }
}