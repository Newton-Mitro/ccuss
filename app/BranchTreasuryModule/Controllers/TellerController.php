<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Teller;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Teller::query()->with('branch');

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('branch', function ($b) use ($search) {
                        $b->where('name', 'like', "%{$search}%");
                    });
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

        $tellers = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('branch-cash-and-treasury/tellers/index', [
            'tellers' => $tellers,
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

    // Create page
    public function create(): Response
    {
        $users = User::all();
        $branches = Branch::all();
        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => $users,
            'branches' => $branches,
            'backUrl' => route('tellers.index'),
        ]);
    }

    // Store
    public function store(Request $request)
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'user_id' => 'required|exists:users,id',
            'code' => 'required|unique:tellers,code',
            'name' => 'required|string|max:255',
            'max_cash_limit' => 'required|numeric',
            'max_transaction_limit' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        Teller::create($data);

        return redirect()->route('tellers.index')
            ->with('success', 'Teller created successfully.');
    }

    // Edit page
    public function edit(Teller $teller): Response
    {
        $users = User::all();
        $branches = Branch::all();
        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => $users,
            'teller' => $teller,
            'branches' => $branches,
            'backUrl' => route('tellers.index'),
        ]);
    }

    // Update
    public function update(Request $request, Teller $teller)
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'user_id' => 'required|exists:users,id',
            'code' => 'required|unique:tellers,code,' . $teller->id,
            'name' => 'required|string|max:255',
            'max_cash_limit' => 'required|numeric',
            'max_transaction_limit' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        $teller->update($data);

        return redirect()->route('tellers.index')
            ->with('success', 'Teller updated successfully.');
    }

    // Show
    public function show(Teller $teller)
    {
        return Inertia::render('branch-cash-and-treasury/tellers/show_teller_page', [
            'teller' => $teller->load(['branch', 'user']),
        ]);
    }

    // Delete
    public function destroy(Teller $teller)
    {
        $teller->delete();

        return redirect()->route('tellers.index')
            ->with('success', 'Teller deleted successfully.');
    }
}