<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashManagementDataService;
use App\TreasuryAndCash\Application\TellerSessionService;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\Vault;
use App\TreasuryAndCash\Requests\CloseTellerSessionRequest;
use App\TreasuryAndCash\Requests\StoreTellerSessionRequest;
use App\TreasuryAndCash\Requests\StoreTellerRequest;
use App\TreasuryAndCash\Requests\StoreVaultRequest;
use App\SystemAdministration\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CashManagementController extends Controller
{
    public function __construct(
        private readonly CashManagementDataService $cashManagementDataService,
        private readonly TellerSessionService $tellerSessionService,
    ) {
        $this->middleware('permission:cash_management.view')->only(['vaults', 'tellers']);
        $this->middleware('permission:cash_management.create')->only(['createVault', 'storeVault', 'createTeller', 'storeTeller']);
        $this->middleware('permission:teller_sessions.view')->only(['tellerSessions']);
        $this->middleware('permission:teller_sessions.open')->only(['openSession']);
        $this->middleware('permission:teller_sessions.close')->only(['closeSession']);
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

    public function createVault(): Response
    {
        return Inertia::render('treasury-cash/vaults/create');
    }

    public function storeVault(StoreVaultRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required to create a vault.');

        DB::transaction(function () use ($request, $organization, $user): void {
            $data = $request->validated();
            $location = CashLocation::create([
                'organization_id' => $organization->id,
                'branch_id' => $user->branch_id,
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

    public function createTeller(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required to create a teller.');

        return Inertia::render('treasury-cash/tellers/create', [
            'users' => User::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->where('branch_id', $user->branch_id)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function storeTeller(StoreTellerRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();
        $data = $request->validated();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required to create a teller.');
        abort_unless(
            User::query()
                ->whereKey($data['user_id'])
                ->where('organization_id', $organization->id)
                ->where('branch_id', $user->branch_id)
                ->exists(),
            404,
        );

        DB::transaction(function () use ($data, $organization, $user): void {
            $location = CashLocation::create([
                'organization_id' => $organization->id,
                'branch_id' => $user->branch_id,
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

    private function authorizeTellerSession(TellerSession $tellerSession, Request $request): void
    {
        abort_unless(
            $tellerSession->branchDay
            && $tellerSession->branchDay->organization_id === $request->attributes->get('active_organization')->id
            && $tellerSession->branchDay->branch_id === $request->user()->branch_id,
            404,
        );
    }
}
