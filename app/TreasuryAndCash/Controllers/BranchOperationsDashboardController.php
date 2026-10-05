<?php

namespace App\TreasuryAndCash\Controllers;

use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchOperationsDashboardController
{
    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $user = $request->user();
        $branch = $user?->branch_id
            ? Branch::query()
                ->where('organization_id', $organizationId)
                ->find($user->branch_id)
            : null;

        $openBranchDay = $branch
            ? BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branch->id)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->first()
            : null;

        $openSessions = $branch
            ? TellerSession::query()
                ->where('status', 'OPEN')
                ->whereHas('branchDay', fn($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branch->id)
                    ->where('status', BranchDay::STATUS_OPEN))
                ->with(['teller', 'branchDay'])
                ->latest('opened_at')
                ->get()
            : collect();

        $branchTransactionQuery = fn() => TellerCashTransaction::query()
            ->whereHas('branchDay', fn($query) => $query
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branch->id));

        $recentActivity = $branch
            ? $branchTransactionQuery()
                ->with(['cashLocation', 'tellerSession.teller'])
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn(TellerCashTransaction $transaction) => [
                    'id' => $transaction->id,
                    'transaction_no' => $transaction->transaction_no,
                    'type' => $transaction->type,
                    'amount' => (float) $transaction->amount,
                    'status' => $transaction->status,
                    'requested_at' => $transaction->requested_at?->toDateTimeString(),
                    'cash_location' => $transaction->cashLocation?->name,
                    'teller' => $transaction->tellerSession?->teller?->name,
                ])
                ->values()
            : collect();

        return Inertia::render('branch-operations/dashboard', [
            'branch' => $branch ? [
                'id' => $branch->id,
                'code' => $branch->code,
                'name' => $branch->name,
            ] : null,
            'branch_day' => $openBranchDay ? [
                'id' => $openBranchDay->id,
                'business_date' => $openBranchDay->business_date,
                'status' => $openBranchDay->status,
                'opened_at' => $openBranchDay->opened_at?->toDateTimeString(),
            ] : null,
            'metrics' => [
                'assigned_tellers' => $branch
                    ? Teller::query()
                        ->where('status', 'ACTIVE')
                        ->whereHas('cashLocation', fn($query) => $query
                            ->where('organization_id', $organizationId)
                            ->where('branch_id', $branch->id)
                            ->where('is_active', true))
                        ->count()
                    : 0,
                'open_sessions' => $openSessions->count(),
                'pending_transactions' => $branch
                    ? $branchTransactionQuery()->where('status', 'PENDING')->count()
                    : 0,
                'posted_today_amount' => $openBranchDay
                    ? (float) TellerCashTransaction::query()
                        ->where('branch_day_id', $openBranchDay->id)
                        ->where('status', 'POSTED')
                        ->sum('amount')
                    : 0,
            ],
            'open_sessions' => $openSessions->map(fn(TellerSession $session) => [
                'id' => $session->id,
                'teller_name' => $session->teller?->name ?? 'Teller',
                'teller_code' => $session->teller?->code,
                'business_date' => $session->branchDay?->business_date,
                'opened_at' => $session->opened_at?->toDateTimeString(),
                'expected_cash' => (float) ($session->expected_cash ?? $session->opening_cash ?? 0),
            ])->values()->all(),
            'recent_activity' => $recentActivity->all(),
        ]);
    }
}