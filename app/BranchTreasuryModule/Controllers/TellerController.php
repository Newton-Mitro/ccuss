<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Teller;
use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Teller::query()->with(['branch', 'user', 'account']);
        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas(
                        'branch',
                        fn($b) =>
                        $b->where('name', 'like', "%{$search}%")
                    )
                    ->orWhereHas(
                        'user',
                        fn($u) =>
                        $u->where('name', 'like', "%{$search}%")
                    );
            });
        }
        // 🏢 Branch Filter
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        // 🏦 Account Filter (NEW - matches schema)
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        // 📊 Status Filter (is_active)
        if ($request->filled('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }
        $tellers = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();
        return Inertia::render('branch-cash-and-treasury/tellers/index', [
            'tellers' => $tellers,
            'filters' => $request->only([
                'search',
                'branch_id',
                'account_id',
                'is_active',
                'per_page',
                'page',
            ]),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function create(): Response
    {
        $branch = Auth::user()->branch;
        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => User::where('branch_id', $branch->id)->get(),
            'userBranch' => $branch,
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $organizationId = Auth::user()->organization_id;
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'user_id' => 'required|exists:users,id',
            'max_cash_limit' => 'required|numeric|min:0',
            'max_transaction_limit' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        return DB::transaction(function () use ($data, $organizationId) {

            // 1. Create Teller
            $teller = Teller::create([
                'branch_id' => $data['branch_id'] ?? Auth::user()->branch_id,
                'user_id' => $data['user_id'],
                'name' => $data['name'],
                'max_cash_limit' => $data['max_cash_limit'],
                'max_transaction_limit' => $data['max_transaction_limit'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            // 2. Create Teller Cash Account (🔥 core)
            $account = Account::create([
                'organization_id' => $organizationId,
                'branch_id' => $data['branch_id'] ?? Auth::user()->branch_id,

                'account_number' => 'T-' . $teller->id,
                'name' => $data['name'],

                'type' => 'teller',
                'balance' => 0,
                'status' => 'active',

                // polymorphic
                'accountable_type' => Teller::class,
                'accountable_id' => $teller->id,
            ]);

            // 3. Link back
            $teller->update([
                'account_id' => $account->id,
            ]);

            return redirect()
                ->route('tellers.index')
                ->with('success', 'Teller created successfully.');
        });
    }

    public function edit(Teller $teller): Response
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $branch = Auth::user()->branch;

        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => User::where('branch_id', $branch->id)->get(),
            'teller' => $teller->load(['account']),
            'userBranch' => $branch,
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Teller $teller)
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'max_cash_limit' => 'required|numeric|min:0',
            'max_transaction_limit' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $teller) {

            $teller->update([
                'user_id' => $data['user_id'],
                'branch_id' => $data['branch_id'] ?? Auth::user()->branch_id,
                'name' => $data['name'],
                'max_cash_limit' => $data['max_cash_limit'],
                'max_transaction_limit' => $data['max_transaction_limit'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            $teller->account?->update([
                'branch_id' => $data['branch_id'] ?? Auth::user()->branch_id,
                'name' => $data['name'],
            ]);
        });

        return redirect()
            ->route('tellers.index')
            ->with('success', 'Teller updated successfully.');
    }

    public function show(Teller $teller)
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('branch-cash-and-treasury/tellers/show_teller_page', [
            'teller' => $teller->load(['branch', 'user', 'account']),
        ]);
    }

    public function destroy(Teller $teller)
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        if ($teller->sessions()->exists()) {
            return back()->withErrors([
                'teller' => 'Cannot delete teller with active sessions'
            ]);
        }

        DB::transaction(function () use ($teller) {
            $teller->account?->delete();
            $teller->delete();
        });

        return redirect()
            ->route('tellers.index')
            ->with('success', 'Teller deleted successfully.');
    }
}