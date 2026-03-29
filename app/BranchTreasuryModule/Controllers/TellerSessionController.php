<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\TellerSession;
use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\BranchDay;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TellerSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = TellerSession::query()
            ->with(['teller', 'branchDay']);

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('opening_cash', 'like', "%{$search}%")
                    ->orWhere('closing_cash', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")

                    // Search by teller name
                    ->orWhereHas('teller', function ($t) use ($search) {
                        $t->where('name', 'like', "%{$search}%");
                    })

                    // Search by business date
                    ->orWhereHas('branchDay', function ($b) use ($search) {
                        $b->where('business_date', 'like', "%{$search}%");
                    });
            });
        }

        // 🎯 Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query
            ->latest()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        return Inertia::render('branch-cash-and-treasury/teller-sessions/list_teller_session_page', [
            'sessions' => $sessions,
            'filters' => $request->only([
                'search',
                'status',
                'per_page',
                'page'
            ]),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $userTeller = Teller::where('user_id', $user->id)->where('is_active', true)->first();
        $userBranchBusinessDay = BranchDay::where('branch_id', $user->branch_id)->where('status', 'open')->first();
        return Inertia::render('branch-cash-and-treasury/teller-sessions/open_teller_session_page', [
            'teller' => $userTeller,
            'branch_day' => $userBranchBusinessDay
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'teller_id' => 'required|exists:tellers,id',
            'branch_day_id' => 'required|exists:branch_days,id',
        ]);

        // 🚫 Prevent multiple OPEN sessions for same teller
        $exists = TellerSession::where('teller_id', $request->teller_id)
            ->where('status', 'open')
            ->exists();

        if ($exists) {
            return back()->withErrors('Teller already has an open session');
        }

        // 🚫 Ensure branch day is OPEN
        $branchDay = BranchDay::find($request->branch_day_id);
        if (!$branchDay || $branchDay->status !== 'open') {
            return back()->withErrors('Invalid or closed branch day');
        }

        TellerSession::create([
            'teller_id' => $request->teller_id,
            'branch_day_id' => $request->branch_day_id,
            'opening_cash' => $request->opening_cash,
            'opened_at' => now(),
            'status' => 'open',
        ]);

        return redirect()
            ->route('teller-sessions.index')
            ->with('success', 'Teller session opened successfully');
    }

    public function show(TellerSession $tellerSession)
    {
        return Inertia::render('branch-cash-and-treasury/teller-sessions/show_teller_session_page', [
            'session' => $tellerSession->load(['teller', 'branchDay']),
        ]);
    }

    public function closePage(TellerSession $tellerSession)
    {
        return Inertia::render('branch-cash-and-treasury/teller-sessions/close_teller_session_page', [
            'session' => $tellerSession->load(['teller', 'branchDay']),
        ]);
    }

    public function close(Request $request, TellerSession $tellerSession)
    {
        if ($tellerSession->status === 'closed') {
            return back()->withErrors('Session already closed');
        }

        $request->validate([
            'closing_cash' => 'required|numeric|min:0',
        ]);

        $tellerSession->update([
            'closing_cash' => $request->closing_cash,
            'closed_at' => now(),
            'status' => 'closed',
        ]);

        return back()->with('success', 'Teller session closed successfully');
    }
}