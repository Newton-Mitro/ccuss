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
        $startDate = today()->subDays(6)->toDateString();
        $endDate = today()->toDateString();

        $postedVoucherTotals = Voucher::query()
            ->where('organization_id', $organizationId)
            ->where('status', 'POSTED')
            ->whereDate('voucher_date', '>=', $startDate)
            ->whereDate('voucher_date', '<=', $endDate)
            ->selectRaw('DATE(voucher_date) as voucher_day, COUNT(*) as total')
            ->groupByRaw('DATE(voucher_date)')
            ->pluck('total', 'voucher_day');

        $dailyVoucherActivity = collect(range(6, 0))->map(function (int $daysAgo) use ($postedVoucherTotals): array {
            $date = today()->subDays($daysAgo);
            $key = $date->toDateString();

            return [
                'date' => $key,
                'label' => $date->format('D'),
                'posted' => (int) ($postedVoucherTotals->get($key) ?? 0),
            ];
        })->values();

        $voucherStatusTotals = Voucher::query()
            ->where('organization_id', $organizationId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $voucherStatusBreakdown = collect(['DRAFT', 'POSTED', 'REVERSED', 'CANCELLED'])
            ->map(fn (string $status): array => [
                'status' => $status,
                'count' => (int) ($voucherStatusTotals->get($status) ?? 0),
            ])
            ->values();

        return Inertia::render('general-accounting/dashboard', [
            'stats' => [
                'accountGroups' => AccountGroup::where('organization_id', $organizationId)->count(),
                'ledgerAccounts' => LedgerAccount::where('organization_id', $organizationId)->count(),
                'openFiscalYears' => FiscalYear::where('organization_id', $organizationId)
                    ->where('status', 'OPEN')
                    ->count(),
                'openFiscalPeriods' => FiscalPeriod::whereHas(
                    'fiscalYear',
                    fn ($query) => $query->where('organization_id', $organizationId),
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
            'dailyVoucherActivity' => $dailyVoucherActivity,
            'voucherStatusBreakdown' => $voucherStatusBreakdown,
        ]);
    }
}
