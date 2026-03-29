<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Teller;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Auth;
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
        $branch = Auth::user()->branch;
        $users = User::where('branch_id', auth()->user()->branch_id)->get();
        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => $users,
            'branch' => $branch,
            'backUrl' => route('tellers.index'),
        ]);
    }

    // Store
    public function store(Request $request)
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'max_cash_limit' => 'required|numeric',
            'max_transaction_limit' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        // Generate a unique Teller code: TLR-<branch_id>-<increment_id>
        $lastTeller = Teller::where('branch_id', $data['branch_id'])
            ->latest('id')
            ->first();

        $nextId = $lastTeller ? $lastTeller->id + 1 : 1;

        $data['code'] = 'TLR-' . str_pad($data['branch_id'], 3, '0', STR_PAD_LEFT)
            . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        // Default is_active if not provided
        $data['is_active'] = $data['is_active'] ?? true;

        $teller = Teller::create($data);

        return redirect()->route('tellers.index')
            ->with('success', 'Teller created successfully with code: ' . $teller->code);
    }

    // Edit page
    public function edit(Teller $teller): Response
    {

        $branch = Auth::user()->branch;
        $users = User::where('branch_id', auth()->user()->branch_id)->get();
        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => $users,
            'teller' => $teller,
            'branch' => $branch,
            'backUrl' => route('tellers.index'),
        ]);
    }

    // Update
    public function update(Request $request, Teller $teller)
    {
        // Ensure the teller belongs to the authenticated user's branch
        if ($teller->branch_id !== auth()->user()->branch_id) {
            abort(403, 'Unauthorized access to update this teller.');
        }

        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'max_cash_limit' => 'required|numeric',
            'max_transaction_limit' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        // Optional: prevent changing branch for security
        $data['branch_id'] = $teller->branch_id;

        // Update teller
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