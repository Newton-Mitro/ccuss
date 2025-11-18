<?php

namespace App\Accounting\GlAccount\Controllers;

use App\Accounting\GlAccount\Models\GlAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GlAccountController extends Controller
{
    public function index(): Response
    {
        // Load all top-level accounts with children recursively for tree rendering
        $glAccounts = GlAccount::with([
            'children' => function ($query) {
                $query->orderBy('code')->with('children');
            }
        ])
            ->whereNull('parent_id')
            ->orderBy('code')
            ->get();

        // Load only GROUP accounts for parent selection dropdown in modal
        $groupAccounts = GlAccount::where('category', 'GROUP')
            ->orderBy('code')
            ->get();

        return Inertia::render('accounting/gl-accounts/index', [
            'glAccounts' => $glAccounts,
            'groupAccounts' => $groupAccounts,
            'flash' => session()->all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:gl_accounts,code',
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'category' => 'required|in:GL,GROUP',
            'parent_id' => 'nullable|exists:gl_accounts,id',
        ]);

        $parent = GlAccount::find($data['parent_id']);

        $glAccount = GlAccount::create($data);

        // If has parent, mark parent as non-leaf
        if ($parent) {
            $parent->update(['is_leaf' => false]);
        }

        return redirect()->back()->with('success', 'GL Account created successfully.');
    }

    public function move(Request $request)
    {
        $request->validate([
            'gl_id' => 'required|exists:gl_accounts,id',
            'parent_id' => 'required|exists:gl_accounts,id',
        ]);

        GlAccount::where('id', $request->gl_id)
            ->update(['parent_id' => $request->parent_id]);

        return back()->with('success', 'GL account moved successfully!');
    }

    public function update(Request $request, GlAccount $gl_account)
    {
        // dd($gl_account);
        // dd($request->all());
        // Normalize values before comparison
        $request->merge([
            'category' => strtoupper(trim($request->category)),
            'code' => trim($request->code),
        ]);

        $rules = [
            'name' => 'required|string|max:100',
            'type' => 'required|in:ASSET,LIABILITY,EQUITY,INCOME,EXPENSE',
            'category' => 'required|in:GL,GROUP',
            'parent_id' => 'nullable|exists:gl_accounts,id',
        ];

        // Check uniqueness ONLY if code changed
        if ($request->code !== $gl_account->code) {
            $rules['code'] = [
                'required',
                'string',
                'max:50',
                Rule::unique('gl_accounts', 'code')->ignore($gl_account->id),
            ];
        } else {
            $rules['code'] = ['required', 'string', 'max:50'];
        }

        $data = $request->validate($rules);

        $gl_account->update($data);


        return back()->with('success', 'GL Account updated successfully.');
    }

    public function destroy(GlAccount $glAccount)
    {
        // Prevent deletion if it has children
        if ($glAccount->children()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete account with children.');
        }

        $parent = $glAccount->parent;
        $glAccount->delete();

        // Update parent is_leaf if it has no more children
        if ($parent && $parent->children()->count() === 0) {
            $parent->update(['is_leaf' => true]);
        }

        return redirect()->back()->with('success', 'GL Account deleted successfully.');
    }
}
