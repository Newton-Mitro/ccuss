<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\Teller;
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
        $query = Teller::query()
            ->with(['branch', 'user', 'account']);

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
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

    public function create(): Response
    {
        $branch = Auth::user()->branch;

        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => User::where('branch_id', $branch->id)->get(),
            'branch' => $branch,
            'backUrl' => route('tellers.index'),
        ]);
    }

    public function store(Request $request)
    {
        $branchId = Auth::user()->branch_id;

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'account_id' => 'required|exists:accounts,id', // ✅ REQUIRED
            'name' => 'required|string|max:255',
            'max_cash_limit' => 'required|numeric|min:0',
            'max_transaction_limit' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        return DB::transaction(function () use ($data, $branchId) {

            // 🔐 Force branch from auth (never trust frontend)
            $data['branch_id'] = $branchId;

            // ⚠️ Safer code generation (still simple but wrapped in TX)
            $lastId = Teller::lockForUpdate()->max('id') ?? 0;
            $nextId = $lastId + 1;

            $data['code'] = 'TLR-'
                . str_pad($branchId, 3, '0', STR_PAD_LEFT)
                . '-'
                . str_pad($nextId, 5, '0', STR_PAD_LEFT);

            $data['is_active'] = $data['is_active'] ?? true;

            $teller = Teller::create($data);

            return redirect()
                ->route('tellers.index')
                ->with('success', 'Teller created: ' . $teller->code);
        });
    }

    public function edit(Teller $teller): Response
    {
        // 🔐 Branch isolation
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $branch = Auth::user()->branch;

        return Inertia::render('branch-cash-and-treasury/tellers/teller-form', [
            'users' => User::where('branch_id', $branch->id)->get(),
            'teller' => $teller->load('account'),
            'branch' => $branch,
            'backUrl' => route('tellers.index'),
        ]);
    }

    public function update(Request $request, Teller $teller)
    {
        if ($teller->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'account_id' => 'required|exists:accounts,id', // ✅ REQUIRED
            'name' => 'required|string|max:255',
            'max_cash_limit' => 'required|numeric|min:0',
            'max_transaction_limit' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        // 🔐 Prevent branch tampering
        $data['branch_id'] = $teller->branch_id;

        $teller->update($data);

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

        // 🚫 Prevent delete if sessions exist
        if ($teller->sessions()->exists()) {
            return back()->withErrors([
                'teller' => 'Cannot delete teller with existing sessions'
            ]);
        }

        $teller->delete();

        return redirect()
            ->route('tellers.index')
            ->with('success', 'Teller deleted successfully.');
    }
}