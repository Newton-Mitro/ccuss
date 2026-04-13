<?php

namespace App\BranchTreasuryModule\Controllers;

use App\Http\Controllers\Controller;
use App\BranchTreasuryModule\Models\TellerSession;
use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\BranchDay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
                $q->where('status', 'like', "%{$search}%")
                    ->orWhereHas(
                        'teller',
                        fn($t) =>
                        $t->where('name', 'like', "%{$search}%")
                    )
                    ->orWhereHas(
                        'branchDay',
                        fn($b) =>
                        $b->where('business_date', 'like', "%{$search}%")
                    );
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query
            ->latest()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        return Inertia::render(
            'branch-cash-and-treasury/teller-sessions/list_teller_session_page',
            [
                'sessions' => $sessions,
                'filters' => $request->only([
                    'search',
                    'status',
                    'per_page',
                    'page'
                ]),
            ]
        );
    }

    public function create()
    {
        $user = Auth::user();

        $teller = Teller::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        $branchDay = BranchDay::where('branch_id', $user->branch_id)
            ->where('status', 'open')
            ->first();

        return Inertia::render(
            'branch-cash-and-treasury/teller-sessions/open_teller_session_page',
            [
                'teller' => $teller,
                'branch_day' => $branchDay
            ]
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'teller_id' => 'required|exists:tellers,id',
            'branch_day_id' => 'required|exists:branch_days,id',
            'cash_account_id' => 'required|exists:accounts,id',
            'opening_cash' => 'required|numeric|min:0',
            'remarks' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($data) {

            $teller = Teller::findOrFail($data['teller_id']);

            // 🔐 Ensure teller belongs to same branch as user
            if ($teller->branch_id !== Auth::user()->branch_id) {
                abort(403);
            }

            // 🚫 Prevent multiple open sessions
            $exists = TellerSession::where('teller_id', $data['teller_id'])
                ->where('status', 'open')
                ->exists();

            if ($exists) {
                return back()->withErrors([
                    'teller_id' => 'Teller already has an open session'
                ]);
            }

            // 🚫 Ensure branch day is open
            $branchDay = BranchDay::findOrFail($data['branch_day_id']);

            if ($branchDay->status !== 'open') {
                return back()->withErrors([
                    'branch_day_id' => 'Branch day is closed'
                ]);
            }

            $session = TellerSession::create([
                'teller_id' => $data['teller_id'],
                'branch_id' => $teller->branch_id,
                'branch_day_id' => $data['branch_day_id'],
                'cash_account_id' => $data['cash_account_id'],
                'opened_at' => now(),
                'status' => 'open',
                'opening_cash' => $data['opening_cash'],
                'remarks' => $data['remarks'] ?? null,
            ]);

            return redirect()
                ->route('teller-sessions.index')
                ->with('success', 'Teller session opened');
        });
    }

    public function show(TellerSession $tellerSession)
    {
        $this->authorizeAccess($tellerSession);

        return Inertia::render(
            'branch-cash-and-treasury/teller-sessions/show_teller_session_page',
            [
                'session' => $tellerSession->load([
                    'teller',
                    'branchDay',
                    'cashAccount'
                ]),
            ]
        );
    }

    public function closePage(TellerSession $tellerSession)
    {
        $this->authorizeAccess($tellerSession);

        return Inertia::render(
            'branch-cash-and-treasury/teller-sessions/close_teller_session_page',
            [
                'session' => $tellerSession->load([
                    'teller',
                    'branchDay'
                ]),
            ]
        );
    }

    public function close(Request $request, TellerSession $tellerSession)
    {
        $this->authorizeAccess($tellerSession);

        if ($tellerSession->status === 'closed') {
            return back()->withErrors([
                'session' => 'Session already closed'
            ]);
        }

        $data = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'remarks' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($tellerSession, $data) {

            // 🧮 Calculate expected balance (basic version)
            $expected = $tellerSession->opening_cash; // later: + transactions - withdrawals

            $difference = $data['closing_cash'] - $expected;

            $tellerSession->update([
                'closing_cash' => $data['closing_cash'],
                'expected_balance' => $expected,
                'difference' => $difference,
                'closed_at' => now(),
                'status' => 'closed',
                'remarks' => $data['remarks'] ?? $tellerSession->remarks,
            ]);

            return back()->with('success', 'Teller session closed');
        });
    }

    private function authorizeAccess(TellerSession $session)
    {
        if ($session->branch_id !== Auth::user()->branch_id) {
            abort(403);
        }
    }
}