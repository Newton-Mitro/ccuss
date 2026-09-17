<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GeneralAccountingDashboardController
{
    public function index(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('general-accounting/dashboard', [
            'stats' => [
                'accountGroups' => AccountGroup::where('organization_id', $organizationId)->count(),
                'ledgerAccounts' => LedgerAccount::where('organization_id', $organizationId)->count(),
                'openFiscalYears' => FiscalYear::where('organization_id', $organizationId)
                    ->where('status', 'OPEN')
                    ->count(),
                'openFiscalPeriods' => FiscalPeriod::whereHas(
                    'fiscalYear',
                    fn($query) => $query->where('organization_id', $organizationId),
                )->where('status', 'OPEN')->count(),
                'draftVouchers' => Voucher::where('organization_id', $organizationId)
                    ->where('status', 'DRAFT')
                    ->count(),
                'postedVouchers' => Voucher::where('organization_id', $organizationId)
                    ->where('status', 'POSTED')
                    ->count(),
                'activeBudgets' => Budget::where('organization_id', $organizationId)
                    ->where('status', 'ACTIVE')
                    ->count(),
            ],
        ]);
    }
}
