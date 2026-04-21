<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Vault;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VaultController extends Controller
{
    public function index(Request $request)
    {
        $query = Vault::query()->with(['branch', 'subledgerAccount']);
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

        if ($request->filled('status')) {
            $query->where('is_active', $request->status);
        }
        $vaults = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();
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
        ]);
    }

    public function store(Request $request)
    {
        $organization = Auth::user()->organization;
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $organization) {
            // 1. Create Vault
            $vault = Vault::create([
                'branch_id' => $data['branch_id'],
                'name' => $data['name'] ?? 'Main Vault',
                'is_active' => $data['is_active'] ?? true,
            ]);
            // 2. Create Account (🔥 core part)
            $subledgerAccount = SubledgerAccount::create([
                'organization_id' => $organization->id ?? null,
                'branch_id' => $data['branch_id'],
                'account_number' => 'V-' . str_pad($vault->id, 5, '0', STR_PAD_LEFT),
                'name' => ($data['name'] ?? 'Vault') . ' (Vault)',
                'type' => 'vault', // 🔥 important
                'status' => 'active',
                // polymorphic
                'accountable_type' => Vault::class,
                'accountable_id' => $vault->id,
            ]);
            // 3. Optional reverse link
            $vault->update([
                'subledger_account_id' => $subledgerAccount->id,
            ]);
        });

        return redirect()->route('vaults.index')->with('success', 'Vault created successfully!');
    }

    public function edit(Vault $vault)
    {
        // 🔐 Branch isolation
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('branch-cash-and-treasury/vaults/edit', [
            'vault' => $vault->load('subledgerAccount'),
            'branch' => Auth::user()->branch,
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function show(Vault $vault)
    {
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('branch-cash-and-treasury/vaults/show_vault_page', [
            'vault' => $vault->load(['branch', 'subledgerAccount', 'denominations.denomination']),
        ]);
    }

    public function update(Request $request, Vault $vault)
    {
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $vault) {
            $vault->update([
                'name' => $data['name'] ?? 'Vault',
                'branch_id' => $data['branch_id'],
                'is_active' => $data['is_active'] ?? true,
            ]);
            $vault->account?->update([
                'name' => ($data['name'] ?? 'Vault') . ' (Vault)',
                'branch_id' => $data['branch_id'],
            ]);
        });

        return redirect()->route('vaults.index')->with('success', 'Vault updated successfully.');
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
            $vault->subledgerAccount?->delete();
            $vault->delete();
        });

        return back()->with('success', 'Vault deleted successfully.');
    }
}