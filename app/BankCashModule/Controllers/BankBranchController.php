<?php

namespace App\BankCashModule\Controllers;

use App\BankCashModule\Models\Bank;
use App\BankCashModule\Models\BankBranch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankBranchController extends Controller
{
    public function index(Request $request)
    {
        $query = BankBranch::with('bank');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('bank', fn($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $branches = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-and-cheque/bank-branches/list-bank-branches-page', [
            'branches' => $branches,
            'filters' => $request->only(['search', 'per_page', 'page']),
            'banks' => Bank::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('BankBranch/Create', [
            'banks' => Bank::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'name' => 'required|string|max:255',
            'routing_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
        ]);

        BankBranch::create($request->all());

        return redirect()->route('bank-branches.index')->with('success', 'Branch created successfully!');
    }

    public function edit(BankBranch $bankBranch)
    {
        return Inertia::render('BankBranch/Edit', [
            'branch' => $bankBranch,
            'banks' => Bank::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, BankBranch $bankBranch)
    {
        $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'name' => 'required|string|max:255',
            'routing_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
        ]);

        $bankBranch->update($request->all());

        return redirect()->route('bank-branches.index')->with('success', 'Branch updated successfully!');
    }

    public function destroy(BankBranch $bankBranch)
    {
        $bankBranch->delete();
        return redirect()->route('bank-branches.index')->with('success', 'Branch deleted successfully!');
    }
}