<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\AccountingReportService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingReportController extends Controller
{
    public function __construct(
        private readonly AccountingReportService $reportService,
    ) {
        $this->middleware('permission:accounting.reports.view');
    }

    public function trialBalance(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $fiscalPeriods = $this->fiscalPeriods($request);
        $periodId = $request->integer('fiscal_period_id') ?: null;
        if ($periodId === null) {
            $today = now()->toDateString();
            $openPeriods = $fiscalPeriods->where('status', 'OPEN');
            $period = $openPeriods->first(
                fn (array $period) => $period['start_date'] <= $today
                    && $period['end_date'] >= $today,
            ) ?? $openPeriods->first(
                fn (array $period) => $period['end_date'] < $today,
            ) ?? $openPeriods->sortBy('start_date')->first()
                ?? $fiscalPeriods->first();
            $periodId = $period['id'] ?? null;
        }

        return Inertia::render('general-accounting/reports/trial-balance-page', [
            'trialBalance' => $this->reportService->trialBalance(
                $organizationId,
                $periodId,
                $request->input('from'),
                $request->input('to'),
            )->map(fn ($row) => [
                'ledger_account_id' => $row->id,
                'account_code' => $row->code,
                'account_name' => $row->name,
                'account_type' => $row->type,
                'total_debit' => $row->debit,
                'total_credit' => $row->credit,
                'balance' => $row->balance,
            ]),
            'fiscalPeriods' => $fiscalPeriods,
            'selectedFiscalPeriod' => $periodId,
        ]);
    }

    public function generalLedger(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $accountId = $request->integer('account_id');
        $accountQuery = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true);
        $account = $accountId > 0
            ? $accountQuery->findOrFail($accountId)
            : $accountQuery->orderBy('code')->first();

        $accounts = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $accountId = $account?->id;

        return Inertia::render('general-accounting/reports/general-ledger-page', [
            'account' => $account,
            'entries' => $account ? $this->reportService->generalLedger(
                $organizationId,
                $accountId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            ) : collect(),
            'accounts' => $accounts,
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['account_id', 'fiscal_period_id', 'from', 'to']),
        ]);
    }

    public function profitAndLoss(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $filters = $this->yearAndPeriodFilters($request, $organizationId);
        $profitAndLoss = $this->reportService->profitAndLoss(
            $organizationId,
            $filters['period']?->id,
            $filters['from'],
            $filters['to'],
        );

        return Inertia::render('general-accounting/reports/profit-and-loss-page', [
            'profitAndLoss' => $profitAndLoss['income']->map(fn ($row) => [
                'ledger_account_id' => $row->id,
                'category' => 'income',
                'account_name' => $row->name,
                'amount' => $row->balance,
            ])->concat($profitAndLoss['expenses']->map(fn ($row) => [
                'ledger_account_id' => $row->id,
                'category' => 'expense',
                'account_name' => $row->name,
                'amount' => $row->balance,
            ])),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request, $filters['year']?->id),
            'selectedFiscalYear' => $filters['year']?->id,
            'selectedFiscalPeriod' => $filters['period']?->id,
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $filters = $this->yearAndPeriodFilters($request, $organizationId);
        $balanceSheet = $filters['year']
            ? $this->reportService->balanceSheetAsOf(
                $organizationId,
                $filters['to'],
                $filters['from'],
                $filters['to'],
            )
            : $this->reportService->balanceSheet(
                $organizationId,
                $filters['period']?->id,
                $filters['from'],
                $filters['to'],
            );

        $balanceSheetRows = collect($balanceSheet)->only(['assets', 'liabilities', 'equity'])->flatMap(fn ($rows, $category) => collect($rows)->map(fn ($row) => [
            'ledger_account_id' => $row->id,
            'category' => ucfirst($category),
            'account_name' => $row->name,
            'balance' => $row->balance,
        ]))->values();
        if (abs((float) $balanceSheet['net_income']) > 0.000001) {
            $balanceSheetRows->push([
                'ledger_account_id' => 0,
                'category' => 'Equity',
                'account_name' => 'Current Year Net Income',
                'balance' => $balanceSheet['net_income'],
            ]);
        }

        return Inertia::render('general-accounting/reports/balance-sheet-page', [
            'balanceSheet' => $balanceSheetRows,
            'fiscalYears' => $this->fiscalYears($request),
            'selectedFiscalYear' => $filters['year']?->id,
        ]);
    }

    public function cashFlow(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $filters = $this->yearAndPeriodFilters($request, $organizationId);

        return Inertia::render('general-accounting/reports/cash-flow-page', [
            'cashFlows' => $this->reportService->cashFlowStatement(
                $organizationId,
                $filters['period']?->id,
                $filters['from'],
                $filters['to'],
            )->map(fn ($row) => (array) $row),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request, $filters['year']?->id),
            'selectedFiscalYear' => $filters['year']?->id,
            'selectedFiscalPeriod' => $filters['period']?->id,
        ]);
    }

    public function shareholdersEquity(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $filters = $this->yearAndPeriodFilters($request, $organizationId);

        return Inertia::render('general-accounting/reports/shareholders-equity-page', [
            'equityStatement' => $this->reportService->shareholdersEquity(
                $organizationId,
                $filters['period']?->id,
                $filters['from'],
                $filters['to'],
            ),
            'fiscalYears' => $this->fiscalYears($request),
            'selectedFiscalYear' => $filters['year']?->id,
        ]);
    }

    private function yearAndPeriodFilters(Request $request, int $organizationId): array
    {
        $periodId = $request->integer('fiscal_period_id');
        $period = $periodId > 0
            ? FiscalPeriod::query()
                ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $organizationId))
                ->with('fiscalYear')
                ->findOrFail($periodId)
            : null;

        $yearId = $request->integer('fiscal_year_id');
        $year = $yearId > 0
            ? FiscalYear::query()->where('organization_id', $organizationId)->findOrFail($yearId)
            : ($period?->fiscalYear ?? $this->defaultFiscalYear($organizationId));

        abort_if($period && $year && (int) $period->fiscal_year_id !== (int) $year->id, 404);

        return [
            'year' => $year,
            'period' => $period,
            'from' => $period?->start_date?->toDateString()
                ?? $year?->start_date?->toDateString()
                ?? $request->input('from'),
            'to' => $period?->end_date?->toDateString()
                ?? $year?->end_date?->toDateString()
                ?? $request->input('to'),
        ];
    }

    private function defaultFiscalYear(int $organizationId): ?FiscalYear
    {
        $years = FiscalYear::query()
            ->where('organization_id', $organizationId)
            ->orderByDesc('start_date')
            ->get();
        $openYears = $years->where('status', 'OPEN');
        $today = now()->toDateString();

        return $openYears->first(
            fn (FiscalYear $year) => $year->start_date->toDateString() <= $today
                && $year->end_date->toDateString() >= $today,
        ) ?? $openYears->first(
            fn (FiscalYear $year) => $year->end_date->toDateString() < $today,
        ) ?? $openYears->sortBy('start_date')->first()
            ?? $years->first();
    }

    private function fiscalPeriods(Request $request, ?int $fiscalYearId = null)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            ))
            ->when($fiscalYearId, fn ($query) => $query->where('fiscal_year_id', $fiscalYearId))
            ->with('fiscalYear:id,name')
            ->orderByDesc('start_date')
            ->get()
            ->map(fn ($period) => [
                'id' => $period->id,
                'fiscal_year_id' => $period->fiscal_year_id,
                'fiscal_year_name' => $period->fiscalYear->name,
                'name' => $period->name,
                'period_name' => $period->name,
                'start_date' => $period->start_date,
                'end_date' => $period->end_date,
                'status' => $period->status,
            ]);
    }

    private function fiscalYears(Request $request)
    {
        return FiscalYear::query()
            ->where('organization_id', $request->attributes->get('active_organization')->id)
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date', 'status'])
            ->map(fn ($year) => [
                'id' => $year->id,
                'name' => $year->name,
                'code' => $year->name,
                'start_date' => $year->start_date,
                'end_date' => $year->end_date,
                'status' => $year->status,
            ]);
    }
}
