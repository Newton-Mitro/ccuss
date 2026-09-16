<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodEndController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:accounting.period_end.close')->only('close');
        $this->middleware('permission:accounting.period_end.reopen')->only('reopen');
        $this->middleware('permission:accounting.year_end.close')->only('yearEndClosing');
    }

    public function close(Request $request): Response
    {
        return $this->periodActionPage($request, 'close');
    }

    public function reopen(Request $request): Response
    {
        return $this->periodActionPage($request, 'reopen');
    }

    public function yearEndClosing(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/period-end/year-end-closing', [
            'fiscalYears' => FiscalYear::query()
                ->where('organization_id', $organizationId)
                ->withCount([
                    'periods',
                    'periods as closed_periods_count' => fn($query) => $query->where('status', 'CLOSED'),
                    'vouchers as draft_vouchers_count' => fn($query) => $query->where('status', 'DRAFT'),
                ])
                ->orderByDesc('start_date')
                ->get(),
            'retainedEarningsAccounts' => LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('type', 'EQUITY')
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ]);
    }

    private function periodActionPage(Request $request, string $operation): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/period-end/period-action', [
            'operation' => $operation,
            'fiscalPeriods' => FiscalPeriod::query()
                ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId))
                ->with('fiscalYear:id,name')
                ->withCount(['vouchers as draft_vouchers_count' => fn($query) => $query->where('status', 'DRAFT')])
                ->orderByDesc('start_date')
                ->get(),
        ]);
    }
}
