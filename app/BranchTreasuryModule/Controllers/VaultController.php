<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Vault;
use App\SystemAdministration\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VaultController extends Controller
{
    public function index(Request $request)
    {
        $query = Vault::query()->with('branch');

        // 🔍 Search (FIX: grouped condition to avoid OR breaking filters)
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('branch', function ($b) use ($search) {
                        $b->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // 🏢 Branch Filter
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // 📊 Status Filter (Active / Inactive)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status);
        }

        // 📦 Pagination
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
        return Inertia::render('branch-cash-and-treasury/vaults/create', [
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'total_balance' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        Vault::create($validated);

        return redirect()->route('vaults.index')
            ->with('success', 'Vault created successfully!');
    }

    public function edit(Vault $vault)
    {
        return Inertia::render('branch-cash-and-treasury/vaults/edit', [
            'vault' => $vault,
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function show(Vault $vault)
    {
        return Inertia::render('branch-cash-and-treasury/vaults/show_vault_page', [
            'vault' => $vault->load('branch'),
        ]);
    }

    public function update(Request $request, Vault $vault)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $vault->update($validated);

        return redirect()
            ->route('vaults.index')
            ->with('success', 'Vault updated successfully.');
    }

    public function destroy(Vault $vault)
    {
        $vault->delete();

        return back()->with('success', 'Vault deleted successfully.');
    }
}