<?php

namespace App\BranchTreasuryModule\Controllers;

use App\BranchTreasuryModule\Models\BranchDay;
use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\TellerSession;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TellerSessionController extends Controller
{
    public function index(Request $request)
    {
        // Get query params for search and pagination
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 20);

        // Fetch teller sessions for the current branch
        $sessions = TellerSession::with(['teller', 'branchDay'])
            ->whereHas('teller', function ($query) {
                $query->where('branch_id', auth()->user()->branch_id);
            })
            ->when($search, function ($query, $search) {
                // Filter by teller name or branch day
                $query->whereHas('teller', fn($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('branchDay', fn($q) => $q->where('business_date', 'like', "%{$search}%"));
            })
            ->orderBy('opened_at', 'desc')
            ->paginate($perPage)
            ->withQueryString(); // preserve search & pagination query strings

        return Inertia::render('cash-and-treasury-module/teller-session/index', [
            'sessions' => $sessions,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('cash-and-treasury-module/teller-session/open-session', [
        ]);
    }

    /**
     * Open a teller session
     */
    public function openSession(Request $request)
    {
        $request->validate([
            'opening_cash' => 'required|numeric|min:0'
        ]);

        $branchDay = BranchDay::where('branch_id', auth()->user()->branch_id)
            ->where('status', 'OPEN')
            ->firstOrFail();

        $teller = Teller::where('user_id', auth()->id())->firstOrFail();

        $session = TellerSession::create([
            'teller_id' => $teller->id,
            'branch_day_id' => $branchDay->id,
            'opening_cash' => $request->opening_cash,
            'opened_at' => now(),
            'status' => 'OPEN'
        ]);

        return Inertia::render('cash-and-treasury-module/teller-session/index', [
            'session' => $session,
            'message' => 'Session opened successfully'
        ]);
    }

    /**
     * Close a teller session
     */
    public function closeSession(Request $request, $id)
    {
        $session = TellerSession::findOrFail($id);

        $request->validate([
            'closing_cash' => 'required|numeric|min:0'
        ]);

        $session->update([
            'closing_cash' => $request->closing_cash,
            'closed_at' => now(),
            'status' => 'CLOSED'
        ]);

        return Inertia::render('cash-and-treasury-module/teller-session/index', [
            'session' => $session,
            'message' => 'Session closed successfully'
        ]);
    }
}