<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashBranchAccessService;
use App\TreasuryAndCash\Application\CashLocationHistoryService;
use App\TreasuryAndCash\Application\CashManagementDataService;
use App\TreasuryAndCash\Application\TellerSessionService;
use App\TreasuryAndCash\Application\VaultSessionService;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\Vault;
use App\TreasuryAndCash\Models\VaultSession;
use App\TreasuryAndCash\Requests\CloseTellerSessionRequest;
use App\TreasuryAndCash\Requests\CloseVaultSessionRequest;
use App\TreasuryAndCash\Requests\StoreTellerSessionRequest;
use App\TreasuryAndCash\Requests\StoreTellerRequest;
use App\TreasuryAndCash\Requests\StoreVaultRequest;
use App\TreasuryAndCash\Requests\StoreVaultSessionRequest;
use App\SystemAdministration\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CashManagementController extends Controller
{
    public function __construct(
        private readonly CashManagementDataService $cashManagementDataService,
        private readonly CashBranchAccessService $cashBranchAccessService,
        private readonly CashLocationHistoryService $cashLocationHistoryService,
        private readonly TellerSessionService $tellerSessionService,
        private readonly VaultSessionService $vaultSessionService,
    ) {
        $this->middleware('permission:cash_management.view')->only(['vaults', 'tellers']);
        $this->middleware('permission:cash_management.create')->only(['createVault', 'storeVault', 'createTeller', 'storeTeller']);
        $this->middleware('permission:cash_management.update')->only(['editVault', 'updateVault', 'editTeller', 'updateTeller']);
        $this->middleware('permission:teller_sessions.view')->only(['tellerSessions']);
        $this->middleware('permission:teller_sessions.open')->only(['createSession', 'openSession']);
        $this->middleware('permission:teller_sessions.close')->only(['closeSession']);
        $this->middleware('permission:vault_sessions.view')->only(['vaultSessions']);
        $this->middleware('permission:vault_sessions.open')->only(['createVaultSession', 'openVaultSession']);
        $this->middleware('permission:vault_sessions.close')->only(['closeVaultSession']);
    }

    public function vaults(Request $request): Response
    {
        $vaults = $this->cashManagementDataService->listVaults(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/vaults/index', [
            'vaults' => $vaults,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function tellers(Request $request): Response
    {
        $tellers = $this->cashManagementDataService->listTellers(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/tellers/index', [
            'tellers' => $tellers,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function createVault(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');

        return Inertia::render('treasury-cash/vaults/create', [
            'branches' => $this->cashBranchAccessService->branchesFor(
                $organization->id,
            ),
            'default_branch_id' => $request->user()->branch_id,
        ]);
    }

    public function storeVault(StoreVaultRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();
        $data = $request->validated();

        if (!$this->cashBranchAccessService->canManage($organization->id, (int) $data['branch_id'])) {
            throw ValidationException::withMessages([
                'branch_id' => 'Select a branch in the active organization.',
            ]);
        }

        DB::transaction(function () use ($data, $organization): void {
            $location = CashLocation::create([
                'organization_id' => $organization->id,
                'branch_id' => $data['branch_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'type' => 'VAULT',
                'is_active' => $data['status'] === 'ACTIVE',
            ]);
            Vault::create([
                'cash_location_id' => $location->id,
                'code' => $data['code'],
                'name' => $data['name'],
                'status' => $data['status'],
                'maximum_balance' => $data['maximum_balance'] ?? null,
            ]);
        });

        return redirect()->route('vaults.index')->with('success', 'Vault created successfully.');
    }

    public function editVault(Request $request, Vault $vault): Response
    {
        $this->authorizeCashLocation($request, $vault->cashLocation);
        $organization = $request->attributes->get('active_organization');
        $cashLocation = $vault->cashLocation;

        return Inertia::render('treasury-cash/vaults/create', [
            'vault' => $vault->load('cashLocation'),
            'branches' => $this->cashBranchAccessService->branchesFor($organization->id),
            'default_branch_id' => $cashLocation->branch_id,
            'branch_locked' => $this->cashLocationHistoryService->hasHistory($cashLocation),
        ]);
    }

    public function updateVault(StoreVaultRequest $request, Vault $vault): RedirectResponse
    {
        $this->authorizeCashLocation($request, $vault->cashLocation);
        $data = $request->validated();
        $cashLocation = $vault->cashLocation;

        if (
            (int) $data['branch_id'] !== (int) $cashLocation->branch_id
            && $this->cashLocationHistoryService->hasHistory($cashLocation)
        ) {
            throw ValidationException::withMessages([
                'branch_id' => 'This vault has operational history and cannot be moved to another branch.',
            ]);
        }

        DB::transaction(function () use ($vault, $cashLocation, $data): void {
            $vault->update([
                'code' => $data['code'],
                'name' => $data['name'],
                'maximum_balance' => $data['maximum_balance'] ?? null,
                'status' => $data['status'],
            ]);
            $cashLocation->update([
                'branch_id' => $data['branch_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'is_active' => $data['status'] === 'ACTIVE',
            ]);
        });

        return redirect()->route('vaults.index')->with('success', 'Vault updated successfully.');
    }

    public function createTeller(Request $request): Response
    {
        $user = $request->user();
        $organization = $request->attributes->get('active_organization');
        $branches = $this->cashBranchAccessService->branchesFor($organization->id);

        return Inertia::render('treasury-cash/tellers/create', [
            'branches' => $branches,
            'default_branch_id' => $user->branch_id,
            'users' => User::query()
                ->forOrganization($organization->id)
                ->orderBy('name')
                ->get(['id', 'branch_id', 'name', 'email']),
        ]);
    }

    public function storeTeller(StoreTellerRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();
        $data = $request->validated();

        if (!$this->cashBranchAccessService->canManage($organization->id, (int) $data['branch_id'])) {
            throw ValidationException::withMessages([
                'branch_id' => 'Select a branch in the active organization.',
            ]);
        }

        abort_unless(
            User::query()
                ->forOrganization($organization->id)
                ->whereKey($data['user_id'])
                ->exists(),
            404,
        );

        DB::transaction(function () use ($data, $organization): void {
            $location = CashLocation::create([
                'organization_id' => $organization->id,
                'branch_id' => $data['branch_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'type' => 'TELLER',
                'is_active' => $data['status'] === 'ACTIVE',
            ]);
            Teller::create([
                'cash_location_id' => $location->id,
                'user_id' => $data['user_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'status' => $data['status'],
                'maximum_cash' => $data['maximum_cash'] ?? null,
            ]);
        });

        return redirect()->route('tellers.index')->with('success', 'Teller created successfully.');
    }

    public function editTeller(Request $request, Teller $teller): Response
    {
        $this->authorizeCashLocation($request, $teller->cashLocation);
        $organization = $request->attributes->get('active_organization');
        $cashLocation = $teller->cashLocation;

        return Inertia::render('treasury-cash/tellers/create', [
            'teller' => $teller->load('cashLocation'),
            'branches' => $this->cashBranchAccessService->branchesFor($organization->id),
            'default_branch_id' => $cashLocation->branch_id,
            'branch_locked' => $this->cashLocationHistoryService->hasHistory($cashLocation),
            'users' => User::query()
                ->forOrganization($organization->id)
                ->orderBy('name')
                ->get(['id', 'branch_id', 'name', 'email']),
        ]);
    }

    public function updateTeller(StoreTellerRequest $request, Teller $teller): RedirectResponse
    {
        $this->authorizeCashLocation($request, $teller->cashLocation);
        $data = $request->validated();
        $cashLocation = $teller->cashLocation;
        $branchId = (int) $data['branch_id'];

        if (
            $branchId !== (int) $cashLocation->branch_id
            && $this->cashLocationHistoryService->hasHistory($cashLocation)
        ) {
            throw ValidationException::withMessages([
                'branch_id' => 'This teller has operational history and cannot be moved to another branch.',
            ]);
        }

        abort_unless(
            User::query()
                ->forOrganization($request->attributes->get('active_organization')->id)
                ->whereKey($data['user_id'])
                ->exists(),
            404,
        );

        DB::transaction(function () use ($teller, $cashLocation, $data): void {
            $teller->update([
                'user_id' => $data['user_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'maximum_cash' => $data['maximum_cash'] ?? null,
                'status' => $data['status'],
            ]);
            $cashLocation->update([
                'branch_id' => $data['branch_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'is_active' => $data['status'] === 'ACTIVE',
            ]);
        });

        return redirect()->route('tellers.index')->with('success', 'Teller updated successfully.');
    }

    private function authorizeCashLocation(Request $request, CashLocation $location): void
    {
        abort_unless(
            $location->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }

    public function tellerSessions(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();
        $tellerSessions = $this->cashManagementDataService->listTellerSessions(
            $organization->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/teller-sessions/index', [
            'teller_sessions' => $tellerSessions,
            ...($user?->branch_id
                ? $this->cashManagementDataService->tellerSessionOptions($organization->id, $user->branch_id)
                : ['branch_day' => null, 'tellers' => []]),
            'filters' => $request->only(['search', 'per_page', 'page']),
            'auth' => [
                'user' => [
                    'branch_id' => $user?->branch_id,
                    'permissions' => $user?->permissions?->all() ?? [],
                    'roles' => $user?->roles?->all() ?? [],
                ],
            ],
        ]);
    }

    public function createSession(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        if (!$user?->branch_id) {
            return Inertia::render('treasury-cash/teller-sessions/create', [
                'branch_day' => null,
                'tellers' => [],
                'user_branch_id' => null,
                'organization' => $organization,
            ]);
        }

        $options = $this->cashManagementDataService->tellerSessionOptions($organization->id, $user->branch_id);

        return Inertia::render('treasury-cash/teller-sessions/create', [
            'branch_day' => $options['branch_day'],
            'tellers' => $options['tellers'],
            'user_branch_id' => $user->branch_id,
            'organization' => $organization,
        ]);
    }

    public function openSession(StoreTellerSessionRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required to open a teller session.');

        try {
            $this->tellerSessionService->open(
                $organization->id,
                $user->branch_id,
                $user->id,
                $request->validated('teller_id'),
                $request->validated('opening_cash'),
                $request->validated('opening_note'),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('teller-sessions.index')
            ->with('success', 'Teller session opened successfully.');
    }

    public function closeSession(CloseTellerSessionRequest $request, TellerSession $tellerSession): RedirectResponse
    {
        $this->authorizeTellerSession($tellerSession, $request);

        try {
            $this->tellerSessionService->close(
                $tellerSession,
                $request->user()->id,
                $request->validated('closing_cash'),
                $request->validated('closing_note'),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('teller-sessions.index')
            ->with('success', 'Teller session closed successfully.');
    }

    public function vaultSessions(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();
        $vaultSessions = $this->cashManagementDataService->listVaultSessions(
            $organization->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/vault-sessions/index', [
            'vault_sessions' => $vaultSessions,
            ...($user?->branch_id
                ? $this->cashManagementDataService->vaultSessionOptions($organization->id, $user->branch_id)
                : ['branch_day' => null, 'vaults' => []]),
            'filters' => $request->only(['search', 'per_page', 'page']),
            'auth' => [
                'user' => [
                    'branch_id' => $user?->branch_id,
                    'permissions' => $user?->permissions?->all() ?? [],
                    'roles' => $user?->roles?->all() ?? [],
                ],
            ],
        ]);
    }

    public function createVaultSession(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        if (!$user?->branch_id) {
            return Inertia::render('treasury-cash/vault-sessions/create', [
                'branch_day' => null,
                'vaults' => [],
                'user_branch_id' => null,
                'organization' => $organization,
            ]);
        }

        $options = $this->cashManagementDataService->vaultSessionOptions($organization->id, $user->branch_id);

        return Inertia::render('treasury-cash/vault-sessions/create', [
            'branch_day' => $options['branch_day'],
            'vaults' => $options['vaults'],
            'user_branch_id' => $user->branch_id,
            'organization' => $organization,
        ]);
    }

    public function openVaultSession(StoreVaultSessionRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required to open a vault session.');

        try {
            $this->vaultSessionService->open(
                $organization->id,
                $user->branch_id,
                $user->id,
                $request->validated('vault_id'),
                $request->validated('opening_cash'),
                $request->validated('opening_note'),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('vault-sessions.index')
            ->with('success', 'Vault session opened successfully.');
    }

    public function closeVaultSession(CloseVaultSessionRequest $request, VaultSession $vaultSession): RedirectResponse
    {
        $this->authorizeVaultSession($vaultSession, $request);

        try {
            $this->vaultSessionService->close(
                $vaultSession,
                $request->user()->id,
                $request->validated('closing_cash'),
                $request->validated('closing_note'),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('vault-sessions.index')
            ->with('success', 'Vault session closed successfully.');
    }

    private function authorizeTellerSession(TellerSession $tellerSession, Request $request): void
    {
        abort_unless(
            $tellerSession->branchDay
            && $tellerSession->branchDay->organization_id === $request->attributes->get('active_organization')->id
            && $tellerSession->branchDay->branch_id === $request->user()->branch_id,
            404,
        );
    }

    private function authorizeVaultSession(VaultSession $vaultSession, Request $request): void
    {
        abort_unless(
            $vaultSession->branchDay
            && $vaultSession->branchDay->organization_id === $request->attributes->get('active_organization')->id
            && $vaultSession->branchDay->branch_id === $request->user()->branch_id,
            404,
        );
    }
}
