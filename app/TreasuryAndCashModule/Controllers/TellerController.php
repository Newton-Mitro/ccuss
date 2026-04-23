<?php

namespace App\TreasuryAndCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCashModule\Models\Teller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Teller::query()->with(['branch', 'user', 'subledgerAccount']);
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
        if ($request->filled('subledger_account_id')) {
            $query->where('subledger_account_id', $request->subledger_account_id);
        }
        // 📊 Status Filter (is_active)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status);
        }
        $tellers = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();
        return Inertia::render('treasury-and-cash/tellers/index', [
            'tellers' => $tellers,
            'filters' => $request->only([
                'search',
                'branch_id',
                'subledger_account_id',
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
        return Inertia::render('treasury-and-cash/tellers/teller-form', [
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
            $subledgerAccount = SubledgerAccount::create([
                'organization_id' => $organizationId,
                'branch_id' => $data['branch_id'] ?? Auth::user()->branch_id,

                'account_number' => 'T-' . str_pad($teller->id, 5, '0', STR_PAD_LEFT),
                'name' => $data['name'],

                'type' => 'teller',
                'status' => 'active',

                // polymorphic
                'accountable_type' => Teller::class,
                'accountable_id' => $teller->id,
            ]);

            // 3. Link back
            $teller->update([
                'subledger_account_id' => $subledgerAccount->id,
            ]);

            return redirect()
                ->route('tellers.index')
                ->with('success', $teller->name . ' Teller created successfully.');
        });
    }

    public function edit(Teller $teller): Response
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $branch = Auth::user()->branch;

        return Inertia::render('treasury-and-cash/tellers/teller-form', [
            'users' => User::where('branch_id', $branch->id)->get(),
            'teller' => $teller->load(['subledgerAccount']),
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
            ->with('success', $teller->name . ' Teller updated successfully.');
    }

    public function show(Teller $teller)
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        return Inertia::render('treasury-and-cash/tellers/show_teller_page', [
            'teller' => $teller->load(['branch', 'user', 'subledgerAccount']),
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
            $teller->subledgerAccount?->delete();
            $teller->delete();
        });

        return redirect()
            ->route('tellers.index')
            ->with('success', $teller->name . ' Teller deleted successfully.');
    }
}