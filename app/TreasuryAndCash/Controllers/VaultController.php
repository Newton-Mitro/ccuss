<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Vault;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class VaultController extends Controller
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
        $query = Vault::query()->whereHas('cashLocation', fn($q) => $q->where('organization_id', $this->organizationId($request)))->with('cashLocation.branch');
        if ($request->filled('search'))
            $query->where('name', 'like', '%' . $request->string('search')->trim() . '%');
        if ($request->filled('branch_id'))
            $query->whereHas('cashLocation', fn($q) => $q->where('branch_id', $request->integer('branch_id')));
        if ($request->filled('status'))
            $query->where('status', $request->string('status')->value() === '1' ? 'ACTIVE' : 'INACTIVE');
        $vaults = $query->latest()->paginate($request->integer('per_page', 18))->withQueryString();
        $vaults->getCollection()->transform(fn(Vault $vault) => $this->present($vault));
        return Inertia::render('treasury-and-cash/vaults/index', [
            'vaults' => $vaults,
            'branches' => Branch::where('organization_id', $this->organizationId($request))->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'branch_id', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('treasury-and-cash/vaults/create', ['branches' => $this->branches($request), 'branch' => $this->branches($request)->first()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['branch_id' => ['required', 'integer'], 'name' => ['required', 'string', 'max:150'], 'is_active' => ['required', 'boolean']]);
        $branch = Branch::where('organization_id', $this->organizationId($request))->findOrFail($data['branch_id']);
        $location = CashLocation::create(['organization_id' => $branch->organization_id, 'branch_id' => $branch->id, 'code' => 'VAULT-' . $branch->id . '-' . uniqid(), 'name' => $data['name'], 'type' => 'VAULT', 'is_active' => $data['is_active']]);
        Vault::create(['cash_location_id' => $location->id, 'code' => $location->code, 'name' => $data['name'], 'status' => $data['is_active'] ? 'ACTIVE' : 'INACTIVE']);
        return redirect()->route('vaults.index')->with('success', 'Vault created successfully.');
    }

    public function show(Request $request, Vault $vault)
    {
        $vault->load('cashLocation.branch');
        $this->authorizeVault($request, $vault);
        return Inertia::render('treasury-and-cash/vaults/show_vault_page', ['vault' => $this->present($vault)]);
    }
    public function edit(Request $request, Vault $vault)
    {
        $vault->load('cashLocation.branch');
        $this->authorizeVault($request, $vault);
        return Inertia::render('treasury-and-cash/vaults/edit', ['vault' => $this->present($vault), 'branches' => $this->branches($request)]);
    }
    public function update(Request $request, Vault $vault)
    {
        $vault->load('cashLocation');
        $this->authorizeVault($request, $vault);
        $data = $request->validate(['branch_id' => ['required', 'integer'], 'name' => ['required', 'string', 'max:150'], 'is_active' => ['required', 'boolean']]);
        $vault->update(['name' => $data['name'], 'status' => $data['is_active'] ? 'ACTIVE' : 'INACTIVE']);
        $vault->cashLocation->update(['branch_id' => $data['branch_id'], 'name' => $data['name'], 'is_active' => $data['is_active']]);
        return redirect()->route('vaults.index')->with('success', 'Vault updated successfully.');
    }
    public function destroy(Request $request, Vault $vault)
    {
        $vault->load('cashLocation');
        $this->authorizeVault($request, $vault);
        $vault->delete();
        $vault->cashLocation?->delete();
        return back()->with('success', 'Vault deleted successfully.');
    }

    private function branches(Request $request)
    {
        return Branch::where('organization_id', $this->organizationId($request))->orderBy('name')->get(['id', 'name', 'code']);
    }
    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }
    private function authorizeVault(Request $request, Vault $vault): void
    {
        abort_unless($vault->cashLocation?->organization_id === $this->organizationId($request), 404);
    }
    private function present(Vault $vault): array
    {
        return ['id' => $vault->id, 'name' => $vault->name, 'is_active' => $vault->status === 'ACTIVE', 'branch_id' => $vault->cashLocation?->branch_id, 'branch' => $vault->cashLocation?->branch, 'created_at' => $vault->created_at, 'updated_at' => $vault->updated_at];
    }
}
