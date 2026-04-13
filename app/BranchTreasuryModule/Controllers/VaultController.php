<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Vault;
use App\SystemAdministration\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            // 👉 you should pass accounts list filtered by branch
        ]);
    }

    public function store(Request $request)
    {
        $branchId = Auth::user()->branch_id;

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id', // ✅ REQUIRED
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // 🔐 Force branch from auth
        $validated['branch_id'] = $branchId;
        $validated['is_active'] = $validated['is_active'] ?? true;

        Vault::create($validated);

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

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id', // ✅ REQUIRED
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // 🔐 Prevent branch change
        $validated['branch_id'] = $vault->branch_id;

        $vault->update($validated);

        return redirect()
            ->route('vaults.index')
            ->with('success', 'Vault updated successfully.');
    }

    public function destroy(Vault $vault)
    {
        if ($vault->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        // 🚫 Prevent delete if denominations exist
        if ($vault->denominations()->exists()) {
            return back()->withErrors([
                'vault' => 'Cannot delete vault with existing denominations'
            ]);
        }

        $vault->delete();

        return back()->with('success', 'Vault deleted successfully.');
    }
}