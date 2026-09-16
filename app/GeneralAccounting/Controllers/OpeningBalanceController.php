<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\OpeningBalanceService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OpeningBalanceController extends Controller
{
    public function __construct(
        private readonly OpeningBalanceService $openingBalanceService,
    ) {
        $this->middleware('permission:accounting.opening_balances.view')->only(['index']);
        $this->middleware('permission:accounting.opening_balances.create')->only(['create', 'store']);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('general-accounting/opening-balances/index', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/opening-balances/create', [
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => $this->accounts($request),
        ]);
    }

    public function store(Request $request)
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $payload = $request->validate([
            'fiscal_period_id' => [
                'required',
                'integer',
                Rule::exists('fiscal_periods', 'id')->where(function ($query) use ($organizationId) {
                    $query->whereExists(function ($subquery) use ($organizationId) {
                        $subquery
                            ->selectRaw('1')
                            ->from('fiscal_years')
                            ->whereColumn('fiscal_years.id', 'fiscal_periods.fiscal_year_id')
                            ->where('organization_id', $organizationId);
                    });
                }),
            ],
            'offset_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(
                    fn($query) => $query->where('organization_id', $organizationId),
                ),
            ],
            'entries.*.amount' => ['required', 'numeric', 'gt:0'],
        ]);

        try {
            $this->openingBalanceService->apply(
                $payload['entries'],
                $organizationId,
                $request->user()->id,
                $payload['fiscal_period_id'],
                $payload['offset_account_id'],
            );
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('opening-balances.index')->with('success', 'Opening balances applied successfully.');
    }

    private function fiscalPeriods(Request $request)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $request->attributes->get('active_organization')->id))
            ->with('fiscalYear')
            ->orderByDesc('start_date')
            ->get();
    }

    private function accounts(Request $request)
    {
        return LedgerAccount::query()
            ->where('organization_id', $request->attributes->get('active_organization')->id)
            ->where('status', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type', 'normal_balance']);
    }
}
