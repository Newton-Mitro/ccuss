<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\Account;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function ledgerSearch(Request $request)
    {
        $search = trim($request->input('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        return response()->json(
            Account::where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
                ->orderBy('code')
                ->limit(20)
                ->get()
                ->map(fn($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'code' => $a->code,
                    'full_display' => "{$a->code} - {$a->name}",
                ])
        );
    }

    public function index(): Response
    {
        $glAccounts = Account::with('childrenRecursive')
            ->whereNull('parent_id')
            ->orderBy('code')
            ->get();

        $groupAccounts = Account::where('is_control_account', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('accounting/accounts/index', [
            'glAccounts' => $glAccounts,
            'groupAccounts' => $groupAccounts,
            'flash' => session()->all(),
        ]);
    }



    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:accounts,code',
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => 'nullable|exists:accounts,id',
        ]);

        $account = Account::create([
            ...$data,
            'is_leaf' => empty($data['is_control_account']),
        ]);

        // If parent exists → mark parent as non-leaf
        if ($account->parent_id) {
            Account::where('id', $account->parent_id)
                ->update(['is_leaf' => false]);
        }

        return back()->with('success', 'Account created successfully.');
    }

    public function move(Request $request)
    {
        $data = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'parent_id' => 'required|exists:accounts,id',
        ]);

        Account::where('id', $data['account_id'])
            ->update(['parent_id' => $data['parent_id']]);

        // Parent is no longer leaf
        Account::where('id', $data['parent_id'])
            ->update(['is_leaf' => false]);

        return back()->with('success', 'Account moved successfully.');
    }

    public function update(Request $request, Account $account)
    {
        $rules = [
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'is_control_account' => 'boolean',
            'parent_id' => 'nullable|exists:accounts,id',
        ];

        if ($request->code !== $account->code) {
            $rules['code'] = [
                'required',
                'string',
                'max:50',
                Rule::unique('accounts', 'code')->ignore($account->id),
            ];
        } else {
            $rules['code'] = 'required|string|max:50';
        }

        $data = $request->validate($rules);

        $account->update($data);

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Account $account)
    {
        if ($account->children()->exists()) {
            return back()->with('error', 'Cannot delete account with children.');
        }

        $parent = $account->parent;
        $account->delete();

        if ($parent && $parent->children()->count() === 0) {
            $parent->update(['is_leaf' => true]);
        }

        return back()->with('success', 'Account deleted successfully.');
    }
}
