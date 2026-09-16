<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\AccountingReportService;
use App\GeneralAccounting\Models\FiscalPeriod;
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
            ),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['fiscal_period_id', 'from', 'to']),
        ]);
    }

    public function generalLedger(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $accountId = $request->integer('account_id');
        abort_unless($accountId > 0, 422, 'An account is required.');

        return Inertia::render('general-accounting/reports/general-ledger-page', [
            'account' => LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->findOrFail($accountId),
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

        return Inertia::render('general-accounting/reports/profit-and-loss-page', [
            'profitAndLoss' => $this->reportService->profitAndLoss(
                $organizationId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            ),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['fiscal_period_id', 'from', 'to']),
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/reports/balance-sheet-page', [
            'balanceSheet' => $this->reportService->balanceSheet(
                $organizationId,
                $request->integer('fiscal_period_id') ?: null,
                $request->input('from'),
                $request->input('to'),
            ),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['fiscal_period_id', 'from', 'to']),
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
            ),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['fiscal_period_id', 'from', 'to']),
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
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['fiscal_period_id', 'from', 'to']),
        ]);
    }

    private function fiscalPeriods(Request $request)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            ))
            ->with('fiscalYear')
            ->orderByDesc('start_date')
            ->get();
    }
}
