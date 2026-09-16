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
        $periodId = $request->integer('fiscal_period_id') ?: null;

        return Inertia::render('general-accounting/reports/trial-balance-page', [
            'trialBalance' => $this->reportService->trialBalance(
                $organizationId,
                $periodId,
                $request->input('from'),
                $request->input('to'),
            )->map(fn($row) => [
                    'ledger_account_id' => $row->id,
                    'account_code' => $row->code,
                    'account_name' => $row->name,
                    'account_type' => $row->type,
                    'total_debit' => $row->debit,
                    'total_credit' => $row->credit,
                    'balance' => $row->balance,
                ]),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'selectedFiscalYear' => $request->integer('fiscal_year_id') ?: null,
            'selectedFiscalPeriod' => $periodId,
        ]);
    }

    public function generalLedger(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $accountId = $request->integer('account_id');
        $account = LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->when($accountId > 0, fn($query) => $query->whereKey($accountId))
            ->orderBy('code')
            ->firstOrFail();

        $accountId = $account->id;

        return Inertia::render('general-accounting/reports/general-ledger-page', [
            'account' => $account,
            'entries' => $this->reportService->generalLedger(
                $organizationId,
                $accountId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            ),
            'accounts' => LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['account_id', 'fiscal_period_id', 'from', 'to']),
        ]);
    }

    public function profitAndLoss(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $profitAndLoss = $this->reportService->profitAndLoss(
            $organizationId,
            $request->integer('fiscal_period_id') ?: null,
            $request->input('from'),
            $request->input('to'),
        );

        return Inertia::render('general-accounting/reports/profit-and-loss-page', [
            'profitAndLoss' => $profitAndLoss['income']->map(fn($row) => [
                'ledger_account_id' => $row->id,
                'category' => 'income',
                'account_name' => $row->name,
                'amount' => $row->balance,
            ])->concat($profitAndLoss['expenses']->map(fn($row) => [
                            'ledger_account_id' => $row->id,
                            'category' => 'expense',
                            'account_name' => $row->name,
                            'amount' => $row->balance,
                        ])),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'selectedFiscalYear' => $request->integer('fiscal_year_id') ?: null,
            'selectedFiscalPeriod' => $request->integer('fiscal_period_id') ?: null,
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/reports/balance-sheet-page', [
            'balanceSheet' => collect($this->reportService->balanceSheet(
                $organizationId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            ))->only(['assets', 'liabilities', 'equity'])->flatMap(fn($rows, $category) => collect($rows)->map(fn($row) => [
                    'ledger_account_id' => $row->id,
                    'category' => ucfirst($category),
                    'account_name' => $row->name,
                    'balance' => $row->balance,
                ]))->values(),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'selectedFiscalYear' => $request->integer('fiscal_year_id') ?: null,
        ]);
    }

    public function cashFlow(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/reports/cash-flow-page', [
            'cashFlows' => $this->reportService->cashFlowStatement(
                $organizationId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            )->map(fn($row) => (array) $row),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'selectedFiscalYear' => $request->integer('fiscal_year_id') ?: null,
            'selectedFiscalPeriod' => $request->integer('fiscal_period_id') ?: null,
        ]);
    }

    public function shareholdersEquity(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/reports/shareholders-equity-page', [
            'equityStatement' => $this->reportService->shareholdersEquity(
                $organizationId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            ),
            'fiscalYears' => $this->fiscalYears($request),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'selectedFiscalYear' => $request->integer('fiscal_year_id') ?: null,
        ]);
    }

    private function fiscalPeriods(Request $request)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            ))
            ->orderByDesc('start_date')
            ->get()
            ->map(fn($period) => [
                'id' => $period->id,
                'fiscal_year_id' => $period->fiscal_year_id,
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
            ->map(fn($year) => [
                'id' => $year->id,
                'name' => $year->name,
                'code' => $year->name,
                'start_date' => $year->start_date,
                'end_date' => $year->end_date,
                'status' => $year->status,
            ]);
    }
}
