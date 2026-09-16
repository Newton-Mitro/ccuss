<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Requests\StoreFiscalPeriodRequest;
use App\GeneralAccounting\Requests\UpdateFiscalPeriodRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FiscalPeriodController extends Controller
{
    public function __construct(
        private readonly FiscalPeriodService $fiscalPeriodService,
    ) {
    }

    public function index(Request $request): Response
    {
        $fiscalPeriods = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            ))
            ->with('fiscalYear')
            ->latest('start_date')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/fiscal-periods/index', [
            'fiscalPeriods' => $fiscalPeriods,
            'fiscalYears' => FiscalYear::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->orderByDesc('start_date')
                ->get(),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/fiscal-periods/fiscal-period-edit', [
            'fiscalYears' => FiscalYear::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->orderByDesc('start_date')
                ->get(),
        ]);
    }

    public function store(StoreFiscalPeriodRequest $request)
    {
        $fiscalYear = $this->organizationFiscalYear($request, (int) $request->validated()['fiscal_year_id']);

        try {
            $this->fiscalPeriodService->create($fiscalYear, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-periods.index')->with('success', 'Fiscal period created successfully.');
    }

    public function edit(Request $request, FiscalPeriod $fiscalPeriod): Response
    {
        $this->authorizeOrganization($request, $fiscalPeriod);

        return Inertia::render('general-accounting/fiscal-periods/fiscal-period-edit', [
            'fiscalPeriod' => $fiscalPeriod,
            'fiscalYears' => FiscalYear::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->orderByDesc('start_date')
                ->get(),
        ]);
    }

    public function update(UpdateFiscalPeriodRequest $request, FiscalPeriod $fiscalPeriod)
    {
        $this->authorizeOrganization($request, $fiscalPeriod);

        try {
            $this->fiscalPeriodService->update($fiscalPeriod, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-periods.index')->with('success', 'Fiscal period updated successfully.');
    }

    public function destroy(Request $request, FiscalPeriod $fiscalPeriod)
    {
        $this->authorizeOrganization($request, $fiscalPeriod);

        try {
            $this->fiscalPeriodService->delete($fiscalPeriod);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('fiscal-periods.index')->with('success', 'Fiscal period deleted successfully.');
    }

    private function organizationFiscalYear(Request $request, int $id): FiscalYear
    {
        return FiscalYear::query()
            ->where('organization_id', $request->attributes->get('active_organization')->id)
            ->findOrFail($id);
    }

    private function authorizeOrganization(Request $request, FiscalPeriod $fiscalPeriod): void
    {
        abort_unless(
            $fiscalPeriod->fiscalYear()->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            )->exists(),
            404,
        );
    }
}
