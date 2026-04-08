<?php

namespace App\BankAndChequeModule\Controllers;

use App\BankAndChequeModule\Models\Bank;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankController extends Controller
{
    public function index(Request $request)
    {
        $query = Bank::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $banks = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-and-cheque/banks/list-banks-page', [
            'banks' => $banks,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('bank-and-cheque/banks/bank-branch-form-page');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Bank
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',

            // Branches
            'branches' => 'required|array|min:1',
            'branches.*.name' => 'required|string|max:255',
            'branches.*.routing_number' => 'nullable|string|max:50',
            'branches.*.address' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {

            $bank = Bank::create([
                'name' => $validated['name'],
                'short_name' => $validated['short_name'] ?? null,
                'swift_code' => $validated['swift_code'] ?? null,
                'routing_number' => $validated['routing_number'] ?? null,
                'status' => $validated['status'],
            ]);

            foreach ($validated['branches'] as $branch) {
                $bank->branches()->create($branch);
            }
        });

        return redirect()
            ->route('banks.index')
            ->with('success', 'Bank & branches created successfully!');
    }

    public function edit(Bank $bank)
    {
        $bank->load('branches');

        return Inertia::render('bank-and-cheque/banks/bank-branch-form-page', [
            'bank' => $bank,
        ]);
    }

    public function show(Bank $bank)
    {
        $bank->load('branches');

        return Inertia::render('bank-and-cheque/banks/show-bank-page', [
            'bank' => $bank,
        ]);
    }

    public function update(Request $request, Bank $bank)
    {
        $validated = $request->validate([
            // Bank
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',

            // Branches
            'branches' => 'required|array|min:1',
            'branches.*.id' => 'nullable|exists:bank_branches,id',
            'branches.*.name' => 'required|string|max:255',
            'branches.*.routing_number' => 'nullable|string|max:50',
            'branches.*.address' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $bank) {

            // ------------------------
            // Update Bank
            // ------------------------
            $bank->update([
                'name' => $validated['name'],
                'short_name' => $validated['short_name'] ?? null,
                'swift_code' => $validated['swift_code'] ?? null,
                'routing_number' => $validated['routing_number'] ?? null,
                'status' => $validated['status'],
            ]);

            // ------------------------
            // Sync Branches
            // ------------------------
            $existingIds = collect($validated['branches'])
                ->pluck('id')
                ->filter()
                ->toArray();

            // Delete removed branches
            $bank->branches()
                ->whereNotIn('id', $existingIds)
                ->delete();

            foreach ($validated['branches'] as $branchData) {

                if (isset($branchData['id'])) {
                    // Update
                    $bank->branches()
                        ->where('id', $branchData['id'])
                        ->update([
                            'name' => $branchData['name'],
                            'routing_number' => $branchData['routing_number'] ?? null,
                            'address' => $branchData['address'] ?? null,
                        ]);
                } else {
                    // Create
                    $bank->branches()->create($branchData);
                }
            }
        });

        return redirect()
            ->route('banks.index')
            ->with('success', 'Bank & branches updated successfully!');
    }

    public function destroy(Bank $bank)
    {
        $bank->delete();

        return redirect()
            ->route('banks.index')
            ->with('success', 'Bank deleted successfully!');
    }
}