<?php

namespace App\Http\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanApplication;
use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\VaultSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function home(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $user = $request->user();
        $pendingApplicationStatuses = ['SUBMITTED', 'UNDER_REVIEW'];

        $dailyAmounts = FinancialTransaction::query()
            ->where('organization_id', $organizationId)
            ->where('status', 'POSTED')
            ->whereBetween('transaction_date', [today()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->selectRaw('DATE(transaction_date) as transaction_day, SUM(amount) as total_amount')
            ->groupByRaw('DATE(transaction_date)')
            ->pluck('total_amount', 'transaction_day');

        $dailyVolume = collect(range(6, 0))->map(function (int $daysAgo) use ($dailyAmounts): array {
            $date = today()->subDays($daysAgo);
            $key = $date->toDateString();

            return [
                'date' => $key,
                'label' => $date->format('D'),
                'amount' => (float) ($dailyAmounts->get($key) ?? 0),
            ];
        })->values();

        $accountMix = FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->selectRaw('account_type, COUNT(*) as total_accounts, SUM(balance) as total_balance')
            ->groupBy('account_type')
            ->orderBy('account_type')
            ->get()
            ->map(fn (FinancialAccount $account): array => [
                'type' => $account->account_type,
                'count' => (int) $account->total_accounts,
                'balance' => (float) $account->total_balance,
            ])
            ->values();

        $recentTransactions = FinancialTransaction::query()
            ->where('organization_id', $organizationId)
            ->with(['branch:id,name', 'entries.financialAccount:id,account_no'])
            ->latest('transaction_date')
            ->limit(6)
            ->get(['id', 'branch_id', 'transaction_no', 'transaction_type', 'transaction_date', 'amount', 'status'])
            ->map(fn (FinancialTransaction $transaction): array => [
                'id' => $transaction->id,
                'number' => $transaction->transaction_no,
                'type' => $transaction->transaction_type,
                'date' => $transaction->transaction_date?->toIso8601String(),
                'amount' => (float) $transaction->amount,
                'status' => $transaction->status,
                'branch' => $transaction->branch?->name,
                'accounts' => $transaction->entries
                    ->pluck('financialAccount.account_no')
                    ->filter()
                    ->unique()
                    ->values()
                    ->all(),
            ])
            ->values();

        $pendingApplications = LoanApplication::query()
            ->where('organization_id', $organizationId)
            ->whereIn('status', $pendingApplicationStatuses)
            ->with('customer:id,name')
            ->latest('created_at')
            ->limit(5)
            ->get(['id', 'customer_id', 'application_no', 'requested_amount', 'status', 'created_at'])
            ->map(fn (LoanApplication $application): array => [
                'id' => $application->id,
                'number' => $application->application_no,
                'applicant' => $application->customer?->name ?? 'Unknown customer',
                'amount' => (float) $application->requested_amount,
                'status' => $application->status,
                'created_at' => $application->created_at?->toIso8601String(),
            ])
            ->values();

        $quickLinks = collect([
            ['permission' => 'financial.loan-applications.view', 'label' => 'Loan applications', 'href' => route('loan-applications.index', [], false)],
            ['permission' => 'financial.accounts.view', 'label' => 'Financial accounts', 'href' => route('financial-accounts.index', [], false)],
            ['permission' => 'financial.transactions.view', 'label' => 'Transactions', 'href' => route('financial-transactions.index', [], false)],
            ['permission' => 'branch_days.view', 'label' => 'Branch days', 'href' => route('branch-days.index', [], false)],
        ])->filter(fn (array $link): bool => $user?->hasPermission($link['permission']) ?? false)
            ->map(fn (array $link): array => ['label' => $link['label'], 'href' => $link['href']])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'branches' => Branch::query()->where('organization_id', $organizationId)->count(),
                'members' => Customer::query()
                    ->where('organization_id', $organizationId)
                    ->where('type', Customer::TYPE_INDIVIDUAL)
                    ->where('status', Customer::STATUS_ACTIVE)
                    ->count(),
                'activeAccounts' => FinancialAccount::query()
                    ->where('organization_id', $organizationId)
                    ->where('status', 'ACTIVE')
                    ->count(),
                'loanPortfolio' => (float) FinancialAccount::query()
                    ->where('organization_id', $organizationId)
                    ->where('account_type', 'LOAN')
                    ->where('status', 'ACTIVE')
                    ->sum('balance'),
                'pendingApplications' => LoanApplication::query()
                    ->where('organization_id', $organizationId)
                    ->whereIn('status', $pendingApplicationStatuses)
                    ->count(),
                'pendingTransactions' => FinancialTransaction::query()
                    ->where('organization_id', $organizationId)
                    ->where('status', 'PENDING')
                    ->count(),
                'monthTransactionVolume' => (float) FinancialTransaction::query()
                    ->where('organization_id', $organizationId)
                    ->where('status', 'POSTED')
                    ->whereBetween('transaction_date', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum('amount'),
                'openBranchDays' => BranchDay::query()
                    ->where('organization_id', $organizationId)
                    ->where('status', BranchDay::STATUS_OPEN)
                    ->count(),
                'openTellerSessions' => TellerSession::query()
                    ->where('status', 'OPEN')
                    ->whereHas('branchDay', fn ($query) => $query->where('organization_id', $organizationId))
                    ->count(),
                'openVaultSessions' => VaultSession::query()
                    ->where('status', 'OPEN')
                    ->whereHas('branchDay', fn ($query) => $query->where('organization_id', $organizationId))
                    ->count(),
            ],
            'dailyVolume' => $dailyVolume,
            'accountMix' => $accountMix,
            'recentTransactions' => $recentTransactions,
            'pendingApplicationsList' => $pendingApplications,
            'quickLinks' => $quickLinks,
            'today' => today()->toDateString(),
        ]);
    }
}
