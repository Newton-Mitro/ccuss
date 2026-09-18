<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TellerController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cash_management.view')->only(['index', 'show']);
        $this->middleware('permission:cash_management.create')->only(['create', 'store']);
        $this->middleware('permission:cash_management.update')->only(['edit', 'update']);
        $this->middleware('permission:cash_management.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Teller::query()->whereHas('cashLocation', fn($q) => $q->where('organization_id', $this->organizationId($request)))->with(['cashLocation.branch', 'user']);
        if ($request->filled('search'))
            $query->where('name', 'like', '%' . $request->string('search')->trim() . '%');
        $tellers = $query->latest()->paginate($request->integer('per_page', 18))->withQueryString();
        $tellers->getCollection()->transform(fn(Teller $teller) => $this->present($teller));
        return Inertia::render('treasury-and-cash/tellers/index', ['tellers' => $tellers, 'branches' => Branch::where('organization_id', $this->organizationId($request))->orderBy('name')->get(['id', 'name']), 'filters' => $request->only(['search', 'branch_id', 'status', 'per_page', 'page'])]);
    }

    public function create(Request $request)
    {
        return Inertia::render('treasury-and-cash/tellers/teller-form', ['branches' => $this->branches($request), 'users' => User::where('organization_id', $this->organizationId($request))->orderBy('name')->get(['id', 'name']), 'userBranch' => $request->user()->branch]);
    }
    public function store(Request $request)
    {
        $data = $request->validate(['branch_id' => ['required', 'integer'], 'user_id' => ['required', 'integer'], 'name' => ['required', 'string', 'max:150'], 'max_cash_limit' => ['nullable', 'numeric', 'min:0']]);
        $branch = Branch::where('organization_id', $this->organizationId($request))->findOrFail($data['branch_id']);
        $location = CashLocation::create(['organization_id' => $branch->organization_id, 'branch_id' => $branch->id, 'code' => 'TELLER-' . $branch->id . '-' . uniqid(), 'name' => $data['name'], 'type' => 'TELLER', 'is_active' => true]);
        Teller::create(['cash_location_id' => $location->id, 'user_id' => $data['user_id'], 'code' => $location->code, 'name' => $data['name'], 'status' => 'ACTIVE', 'maximum_cash' => $data['max_cash_limit'] ?? 0]);
        return redirect()->route('tellers.index')->with('success', 'Teller created successfully.');
    }
    public function show(Request $request, Teller $teller)
    {
        $teller->load(['cashLocation.branch', 'user']);
        $this->authorizeTeller($request, $teller);
        return Inertia::render('treasury-and-cash/tellers/show_teller_page', ['teller' => $this->present($teller)]);
    }
    public function edit(Request $request, Teller $teller)
    {
        $teller->load(['cashLocation.branch', 'user']);
        $this->authorizeTeller($request, $teller);
        return Inertia::render('treasury-and-cash/tellers/teller-form', ['teller' => $this->present($teller), 'branches' => $this->branches($request), 'users' => User::where('organization_id', $this->organizationId($request))->orderBy('name')->get(['id', 'name']), 'userBranch' => $request->user()->branch]);
    }
    public function update(Request $request, Teller $teller)
    {
        $teller->load('cashLocation');
        $this->authorizeTeller($request, $teller);
        $data = $request->validate(['name' => ['required', 'string', 'max:150'], 'max_cash_limit' => ['nullable', 'numeric', 'min:0'], 'is_active' => ['required', 'boolean']]);
        $teller->update(['name' => $data['name'], 'maximum_cash' => $data['max_cash_limit'] ?? 0, 'status' => $data['is_active'] ? 'ACTIVE' : 'INACTIVE']);
        $teller->cashLocation->update(['name' => $data['name'], 'is_active' => $data['is_active']]);
        return redirect()->route('tellers.index')->with('success', 'Teller updated successfully.');
    }
    public function destroy(Request $request, Teller $teller)
    {
        $teller->load('cashLocation');
        $this->authorizeTeller($request, $teller);
        $teller->delete();
        $teller->cashLocation?->delete();
        return back()->with('success', 'Teller deleted successfully.');
    }
    private function branches(Request $request)
    {
        return Branch::where('organization_id', $this->organizationId($request))->orderBy('name')->get(['id', 'name', 'code']);
    }
    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }
    private function authorizeTeller(Request $request, Teller $teller): void
    {
        abort_unless($teller->cashLocation?->organization_id === $this->organizationId($request), 404);
    }
    private function present(Teller $teller): array
    {
        return ['id' => $teller->id, 'name' => $teller->name, 'is_active' => $teller->status === 'ACTIVE', 'branch_id' => $teller->cashLocation?->branch_id, 'branch' => $teller->cashLocation?->branch, 'user_id' => $teller->user_id, 'user' => $teller->user, 'max_cash_limit' => $teller->maximum_cash, 'max_transaction_limit' => 0, 'created_at' => $teller->created_at, 'updated_at' => $teller->updated_at];
    }
}
