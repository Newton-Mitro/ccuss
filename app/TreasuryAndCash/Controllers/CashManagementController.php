<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashManagementDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashManagementController extends Controller
{
    public function __construct(
        private readonly CashManagementDataService $cashManagementDataService,
    ) {
        $this->middleware('permission:cash_management.view')->only(['vaults', 'tellers']);
        $this->middleware('permission:teller_sessions.view')->only(['tellerSessions']);
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

    public function tellerSessions(Request $request): Response
    {
        $tellerSessions = $this->cashManagementDataService->listTellerSessions(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/teller-sessions/index', [
            'teller_sessions' => $tellerSessions,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }
}
