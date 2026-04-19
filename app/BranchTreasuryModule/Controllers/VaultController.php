<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Vault;
use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VaultController extends Controller
{
    public function index(Request $request)
    {
        $query = Vault::query()
            ->with(['branch', 'account']);

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas(
                        'branch',
                        fn($b) =>
                        $b->where('name', 'like', "%{$search}%")
                    );
            });
        }

        // 🏢 Branch Filter
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // 📊 Status Filter
        if ($request->filled('status')) {
            $query->where('is_active', (bool) $request->status);
        }

        $vaults = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('branch-cash-and-treasury/vaults/index', [
            'vaults' => $vaults,
            'filters' => $request->only([
                'search',
                'branch_id',
                'status',
                'per_page',
                'page'
            ]),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        $branch = Auth::user()->branch;

        return Inertia::render('branch-cash-and-treasury/vaults/create', [
            'branch' => $branch,
            'branches' => Branch::select('id', 'name')->get(),
            'accounts' => Account::all(),
            // 👉 you should pass accounts list filtered by branch
        ]);
    }



    public function store(Request $request)
    {
        $branchId = Auth::user()->branch_id;

        $data = $request->validate([
            // account layer
            'name' => 'nullable|string|max:255',
            'account_number' => 'required|string|unique:accounts,account_number',
            'organization_id' => 'nullable|exists:organizations,id',

            // vault layer
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $branchId) {

            // 1. Create Vault
            $vault = Vault::create([
                'branch_id' => $branchId,
                'name' => $data['name'] ?? 'Main Vault',
                'is_active' => $data['is_active'] ?? true,
            ]);

            // 2. Create Account (🔥 core part)
            $account = Account::create([
                'organization_id' => $data['organization_id'] ?? null,
                'branch_id' => $branchId,

                'account_number' => $data['account_number'],
                'name' => ($data['name'] ?? 'Vault') . ' (Vault)',

                'type' => 'vault', // 🔥 important
                'balance' => 0,
                'status' => 'active',

                // polymorphic
                'accountable_type' => Vault::class,
                'accountable_id' => $vault->id,
            ]);

            // 3. Optional reverse link
            $vault->update([
                'account_id' => $account->id,
            ]);
        });

        return redirect()
            ->route('vaults.index')
            ->with('success', 'Vault created successfully!');
    }

    public function edit(Vault $vault)
    {
        // 🔐 Branch isolation
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('branch-cash-and-treasury/vaults/edit', [
            'vault' => $vault->load('account'),
            'branch' => Auth::user()->branch,
            'branches' => Branch::select('id', 'name')->get(),
            'accounts' => Account::all(),
        ]);
    }

    public function show(Vault $vault)
    {
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('branch-cash-and-treasury/vaults/show_vault_page', [
            'vault' => $vault->load(['branch', 'account', 'denominations.denomination']),
        ]);
    }

    public function update(Request $request, Vault $vault)
    {
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'account_number' => "required|string|unique:accounts,account_number,{$vault->account_id}",
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $vault) {

            $vault->update([
                'name' => $data['name'] ?? 'Vault',
                'is_active' => $data['is_active'] ?? true,
            ]);

            $vault->account?->update([
                'name' => ($data['name'] ?? 'Vault') . ' (Vault)',
                'account_number' => $data['account_number'],
            ]);
        });

        return redirect()
            ->route('vaults.index')
            ->with('success', 'Vault updated successfully.');
    }

    public function destroy(Vault $vault)
    {
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        if ($vault->denominations()->exists()) {
            return back()->withErrors([
                'vault' => 'Cannot delete vault with existing denominations'
            ]);
        }

        DB::transaction(function () use ($vault) {
            $vault->account?->delete();
            $vault->delete();
        });

        return back()->with('success', 'Vault deleted successfully.');
    }
}