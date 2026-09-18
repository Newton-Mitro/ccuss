<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class TellerSessionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cash_management.view')->only(['index', 'show']);
        $this->middleware('permission:cash_management.create')->only(['create', 'store']);
        $this->middleware('permission:cash_management.update')->only(['closePage', 'close']);
    }
    public function index(Request $request)
    {
        $query = TellerSession::query()->whereHas('teller.cashLocation', fn($q) => $q->where('organization_id', $this->organizationId($request)))->with(['teller.cashLocation.branch', 'branchDay']);
        if ($request->filled('status'))
            $query->where('status', strtoupper($request->string('status')->value()));
        $sessions = $query->latest()->paginate($request->integer('per_page', 18))->withQueryString();
        return Inertia::render('treasury-and-cash/teller-sessions/list_teller_session_page', ['sessions' => $sessions, 'filters' => $request->only(['search', 'status', 'per_page', 'page'])]);
    }
    public function create(Request $request)
    {
        $day = BranchDay::where('organization_id', $this->organizationId($request))->where('status', BranchDay::STATUS_OPEN)->latest('business_date')->firstOrFail();
        $teller = Teller::whereHas('cashLocation', fn($q) => $q->where('organization_id', $this->organizationId($request)))->where('status', 'ACTIVE')->firstOrFail();
        return Inertia::render('treasury-and-cash/teller-sessions/open_teller_session_page', ['branch_day' => $day, 'teller' => $teller]);
    }
    public function store(Request $request)
    {
        $data = $request->validate(['branch_day_id' => ['required', 'integer'], 'teller_id' => ['required', 'integer'], 'opening_cash' => ['required', 'numeric', 'min:0']]);
        $day = BranchDay::where('organization_id', $this->organizationId($request))->whereKey($data['branch_day_id'])->where('status', BranchDay::STATUS_OPEN)->firstOrFail();
        if (TellerSession::where('branch_day_id', $day->id)->where('teller_id', $data['teller_id'])->exists())
            return back()->with('error', 'A teller session already exists for this branch day.');
        $session = TellerSession::create([...$data, 'status' => 'OPEN', 'opened_by' => $request->user()->id, 'opened_at' => now(), 'expected_cash' => $data['opening_cash']]);
        return redirect()->route('teller-sessions.show', $session)->with('success', 'Teller session opened successfully.');
    }
    public function show(Request $request, TellerSession $tellerSession)
    {
        $this->authorizeSession($request, $tellerSession);
        return Inertia::render('treasury-and-cash/teller-sessions/show_teller_session_page', ['session' => $tellerSession->load(['teller', 'branchDay'])]);
    }
    public function closePage(Request $request, TellerSession $tellerSession)
    {
        $this->authorizeSession($request, $tellerSession);
        return Inertia::render('treasury-and-cash/teller-sessions/close_teller_session_page', ['session' => $tellerSession]);
    }
    public function close(Request $request, TellerSession $tellerSession)
    {
        $this->authorizeSession($request, $tellerSession);
        $data = $request->validate(['closing_cash' => ['required', 'numeric', 'min:0']]);
        $tellerSession->update(['status' => 'CLOSED', 'closing_cash' => $data['closing_cash'], 'cash_difference' => $data['closing_cash'] - (float) $tellerSession->expected_cash, 'closed_by' => $request->user()->id, 'closed_at' => now()]);
        return redirect()->route('teller-sessions.show', $tellerSession)->with('success', 'Teller session closed successfully.');
    }
    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }
    private function authorizeSession(Request $request, TellerSession $session): void
    {
        abort_unless($session->teller()->whereHas('cashLocation', fn($q) => $q->where('organization_id', $this->organizationId($request)))->exists(), 404);
    }
}
