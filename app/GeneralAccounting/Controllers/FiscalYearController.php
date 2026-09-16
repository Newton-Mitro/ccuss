<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Requests\StoreFiscalYearRequest;
use App\GeneralAccounting\Requests\UpdateFiscalYearRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FiscalYearController extends Controller
{
    public function __construct(
        private readonly FiscalYearService $fiscalYearService,
    ) {
        $this->middleware('permission:settings.fiscal_year.view')->only(['index']);
        $this->middleware('permission:settings.fiscal_year.create')->only(['create', 'store']);
        $this->middleware('permission:settings.fiscal_year.update')->only(['edit', 'update']);
        $this->middleware('permission:settings.fiscal_year.delete')->only(['destroy']);
        $this->middleware('permission:accounting.year_end.close')->only(['closeYear']);
    }

    public function index(Request $request): Response
    {
        $fiscalYears = $this->organizationQuery($request)
            ->latest('start_date')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/fiscal-years/index', [
            'fiscalYears' => $fiscalYears,
            'retainedEarningsAccounts' => LedgerAccount::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->where('type', 'EQUITY')
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('general-accounting/fiscal-years/fiscal-year-edit');
    }

    public function store(StoreFiscalYearRequest $request)
    {
        try {
            $data = $request->validated();
            $data['organization_id'] = $request->attributes->get('active_organization')->id;
            $this->fiscalYearService->create($data);
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal year created successfully.');
    }

    public function edit(Request $request, FiscalYear $fiscalYear): Response
    {
        $this->authorizeOrganization($request, $fiscalYear);

        return Inertia::render('general-accounting/fiscal-years/fiscal-year-edit', [
            'fiscalYear' => $fiscalYear,
        ]);
    }

    public function update(UpdateFiscalYearRequest $request, FiscalYear $fiscalYear)
    {
        $this->authorizeOrganization($request, $fiscalYear);

        try {
            $this->fiscalYearService->update($fiscalYear, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal year updated successfully.');
    }

    public function destroy(Request $request, FiscalYear $fiscalYear)
    {
        $this->authorizeOrganization($request, $fiscalYear);

        try {
            $this->fiscalYearService->delete($fiscalYear);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal year deleted successfully.');
    }

    public function closeYear(Request $request, FiscalYear $fiscalYear)
    {
        $this->authorizeOrganization($request, $fiscalYear);
        $validated = $request->validate([
            'retained_earnings_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(fn($query) => $query
                    ->where('organization_id', $request->attributes->get('active_organization')->id)
                    ->where('type', 'EQUITY')
                    ->where('status', true)),
            ],
        ]);

        try {
            $this->fiscalYearService->closeYearWithClosingVoucher(
                $fiscalYear,
                (int) $validated['retained_earnings_account_id'],
                $request->user()->id,
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal year closed successfully.');
    }

    private function organizationQuery(Request $request)
    {
        return FiscalYear::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );
    }

    private function authorizeOrganization(Request $request, FiscalYear $fiscalYear): void
    {
        abort_unless(
            $fiscalYear->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }
}
