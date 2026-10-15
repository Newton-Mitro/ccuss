<?php

namespace App\TreasuryAndCash\Controllers;

use App\TreasuryAndCash\Models\BankTransaction;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\Vault;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TreasuryDashboardController
{
    public function index(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $startDate = today()->subDays(6)->toDateString();
        $endDate = today()->toDateString();

        $tellerDailyTotals = TellerCashTransaction::query()
            ->join('branch_days', 'branch_days.id', '=', 'teller_cash_transactions.branch_day_id')
            ->where('branch_days.organization_id', $organizationId)
            ->whereBetween('branch_days.business_date', [$startDate, $endDate])
            ->where('teller_cash_transactions.status', 'POSTED')
            ->selectRaw('branch_days.business_date as business_date, SUM(teller_cash_transactions.amount) as total_amount')
            ->groupBy('branch_days.business_date')
            ->pluck('total_amount', 'business_date');

        $bankDailyTotals = BankTransaction::query()
            ->join('branch_days', 'branch_days.id', '=', 'bank_transactions.branch_day_id')
            ->where('branch_days.organization_id', $organizationId)
            ->whereBetween('bank_transactions.transaction_date', [$startDate, $endDate])
            ->where('bank_transactions.status', 'POSTED')
            ->selectRaw('bank_transactions.transaction_date as transaction_date, SUM(bank_transactions.amount) as total_amount')
            ->groupBy('bank_transactions.transaction_date')
            ->pluck('total_amount', 'transaction_date');

        $dailyActivity = collect(range(6, 0))->map(function (int $daysAgo) use ($tellerDailyTotals, $bankDailyTotals): array {
            $date = today()->subDays($daysAgo);
            $key = $date->toDateString();

            return [
                'date' => $key,
                'label' => $date->format('D'),
                'teller_cash' => (float) ($tellerDailyTotals->get($key) ?? 0),
                'bank' => (float) ($bankDailyTotals->get($key) ?? 0),
            ];
        })->values();

        $cashLocationBalances = DB::table('cash_locations')
            ->leftJoin('financial_accounts', 'financial_accounts.id', '=', 'cash_locations.financial_account_id')
            ->where('cash_locations.organization_id', $organizationId)
            ->whereIn('cash_locations.type', ['TELLER', 'VAULT', 'PETTY_CASH'])
            ->selectRaw('cash_locations.type as type, COUNT(*) as locations, COALESCE(SUM(financial_accounts.balance), 0) as balance')
            ->groupBy('cash_locations.type')
            ->orderBy('cash_locations.type')
            ->get()
            ->map(fn (object $row): array => [
                'type' => $row->type,
                'locations' => (int) $row->locations,
                'balance' => (float) $row->balance,
            ])
            ->values();

        return Inertia::render('treasury-cash/dashboard', [
            'stats' => [
                'vaults' => Vault::whereHas(
                    'cashLocation',
                    fn ($query) => $query->where('organization_id', $organizationId),
                )->count(),
                'tellers' => Teller::whereHas(
                    'cashLocation',
                    fn ($query) => $query->where('organization_id', $organizationId),
                )->count(),
                'openBranchDays' => BranchDay::where('organization_id', $organizationId)
                    ->where('status', BranchDay::STATUS_OPEN)
                    ->count(),
                'openTellerSessions' => TellerSession::whereHas(
                    'branchDay',
                    fn ($query) => $query->where('organization_id', $organizationId),
                )->where('status', 'OPEN')->count(),
            ],
            'cashAccounts' => CashLocation::query()
                ->where('organization_id', $organizationId)
                ->whereIn('type', ['TELLER', 'VAULT', 'PETTY_CASH'])
                ->with('financialAccount:id,account_no')
                ->orderBy('type')
                ->orderBy('name')
                ->get(['id', 'type', 'code', 'name', 'financial_account_id'])
                ->map(fn (CashLocation $location): array => [
                    'id' => $location->id,
                    'type' => $location->type,
                    'code' => $location->code,
                    'name' => $location->name,
                    'account_no' => $location->financialAccount?->account_no,
                ])
                ->values(),
            'dailyActivity' => $dailyActivity,
            'cashLocationBalances' => $cashLocationBalances,
        ]);
    }
}
