<?php

namespace App\TreasuryAndCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use App\TreasuryAndCashModule\Models\BranchDay;
use App\TreasuryAndCashModule\Models\Teller;
use App\TreasuryAndCashModule\Models\TellerSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TellerSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = TellerSession::query()
            ->with(['teller', 'branchDay'])
            ->where('branch_id', Auth::user()->branch_id);

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', "%{$search}%")
                    ->orWhereHas(
                        'teller',
                        fn($t) => $t->where('name', 'like', "%{$search}%")
                    )
                    ->orWhereHas(
                        'branchDay',
                        fn($b) => $b->where('business_date', 'like', "%{$search}%")
                    );
            });
        }

        // 🎯 Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query
            ->latest()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        return Inertia::render(
            'treasury-and-cash/teller-sessions/list_teller_session_page',
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
        $teller = Teller::where('user_id', $user->id)->where('is_active', true)->first();
        $branchDay = BranchDay::where('branch_id', $user->branch_id)->where('status', 'open')->first();
        $cashAccounts = SubledgerAccount::where('branch_id', $user->branch_id)->get();

        return Inertia::render(
            'treasury-and-cash/teller-sessions/open_teller_session_page',
            [
                'teller' => $teller,
                'branch_day' => $branchDay,
                'cash_accounts' => $cashAccounts,
            ]
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'teller_id' => 'required|exists:tellers,id',
            'branch_day_id' => 'required|exists:branch_days,id',
            'cash_account_id' => 'required|exists:subledger_accounts,id',
            'remarks' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($data) {

            $user = Auth::user();

            $teller = Teller::findOrFail($data['teller_id']);

            // 🔐 Teller must belong to same branch
            if ($teller->branch_id !== $user->branch_id) {
                abort(403, 'Unauthorized teller access');
            }

            $branchDay = BranchDay::findOrFail($data['branch_day_id']);

            // 🔐 Branch day must match branch
            if ($branchDay->branch_id !== $user->branch_id) {
                abort(403, 'Invalid branch day');
            }

            // 🚫 Ensure branch day is open
            if ($branchDay->status !== 'open') {
                return back()->withErrors([
                    'branch_day_id' => 'Branch day is closed'
                ]);
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

            $session = TellerSession::create([
                'teller_id' => $data['teller_id'],
                'branch_id' => $user->branch_id,
                'branch_day_id' => $data['branch_day_id'],
                'cash_account_id' => $data['cash_account_id'],
                'opened_at' => now(),
                'status' => 'open',
                'remarks' => $data['remarks'] ?? null,
            ]);

            return redirect()
                ->route('teller-sessions.index')
                ->with('success', $teller->name . ' Teller session opened successfully');
        });
    }

    public function show(TellerSession $tellerSession)
    {
        $this->authorizeAccess($tellerSession);

        return Inertia::render(
            'treasury-and-cash/teller-sessions/show_teller_session_page',
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
            'treasury-and-cash/teller-sessions/close_teller_session_page',
            [
                'session' => $tellerSession->load([
                    'teller',
                    'branchDay',
                    'cashAccount'
                ]),
            ]
        );
    }

    public function close(Request $request, TellerSession $tellerSession)
    {
        $this->authorizeAccess($tellerSession);

        if ($tellerSession->status !== 'open') {
            return back()->withErrors([
                'session' => 'Only open sessions can be closed'
            ]);
        }

        $data = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'remarks' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($tellerSession, $data) {

            // 🧮 Calculate expected balance from ledger
            $expected = $this->calculateExpectedBalance($tellerSession);

            $difference = $data['closing_cash'] - $expected;

            $tellerSession->update([
                'closing_cash' => $data['closing_cash'],
                'expected_balance' => $expected,
                'difference' => $difference,
                'closed_at' => now(),
                'status' => 'closed',
                'remarks' => $data['remarks'] ?? $tellerSession->remarks,
            ]);

            return back()->with('success', $tellerSession->teller->name . ' Teller session closed successfully');
        });
    }

    // 🧠 Ledger Engine Hook (Plug your accounting system here)
    private function calculateExpectedBalance(TellerSession $session): float
    {
        if (!$session->cash_account_id) {
            return 0;
        }

        // 🚀 Replace with real ledger logic
        // Example:
        // return LedgerEntry::where('subledger_account_id', $session->cash_account_id)
        //     ->sum(DB::raw('debit - credit'));

        return 0;
    }

    // 🔐 Authorization Layer
    private function authorizeAccess(TellerSession $session)
    {
        if ($session->branch_id !== Auth::user()->branch_id) {
            abort(403, 'Unauthorized access to session');
        }
    }
}