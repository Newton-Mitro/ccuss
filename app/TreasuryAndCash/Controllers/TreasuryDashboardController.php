<?php

namespace App\TreasuryAndCash\Controllers;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\Vault;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TreasuryDashboardController
{
    public function index(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/dashboard', [
            'stats' => [
                'vaults' => Vault::whereHas(
                    'cashLocation',
                    fn($query) => $query->where('organization_id', $organizationId),
                )->count(),
                'tellers' => Teller::whereHas(
                    'cashLocation',
                    fn($query) => $query->where('organization_id', $organizationId),
                )->count(),
                'openBranchDays' => BranchDay::where('organization_id', $organizationId)
                    ->where('status', BranchDay::STATUS_OPEN)
                    ->count(),
                'openTellerSessions' => TellerSession::whereHas(
                    'branchDay',
                    fn($query) => $query->where('organization_id', $organizationId),
                )->where('status', 'OPEN')->count(),
            ],
        ]);
    }
}