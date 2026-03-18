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
        $query = Vault::with('branch'); // Include branch relationship

        // ✅ Optional search filter
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('branch', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        // ✅ Pagination
        $vaults = $query->latest()
            ->paginate(
                $request->input('per_page', 10)
            )
            ->withQueryString();

        return Inertia::render('cash-and-treasury-module/vaults/index', [
            'vaults' => $vaults,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }


    public function create()
    {
        return Inertia::render('cash-and-treasury-module/vaults/create', [
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
        return Inertia::render('cash-and-treasury-module/vaults/edit', [
            'vault' => $vault,
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function show(Vault $vault)
    {
        // Optional: redirect to edit or index
        return redirect()->route('vaults.edit', $vault->id);
    }

    public function update(Request $request, Vault $vault)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'total_balance' => 'required|numeric|min:0',
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