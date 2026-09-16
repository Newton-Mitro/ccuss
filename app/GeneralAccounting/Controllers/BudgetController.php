<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\BudgetService;
use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\BudgetEntry;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Requests\StoreBudgetRequest;
use App\GeneralAccounting\Requests\UpdateBudgetRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function __construct(private readonly BudgetService $budgetService)
    {
        $this->middleware('permission:accounting.budgets.view')->only(['index', 'show']);
        $this->middleware('permission:accounting.budgets.create')->only(['create', 'store']);
        $this->middleware('permission:accounting.budgets.update')->only(['edit', 'update']);
        $this->middleware('permission:accounting.budgets.delete')->only('destroy');
        $this->middleware('permission:accounting.budgets.activate')->only('activate');
        $this->middleware('permission:accounting.budgets.close')->only('close');
        $this->middleware('permission:accounting.budgets.report')->only('budgetVsActual');
        $this->middleware('permission:accounting.budget_entries.view')->only('entries');
    }

    public function index(Request $request): Response
    {
        $budgets = $this->organizationQuery($request)
            ->with('fiscalYear')
            ->withCount('entries')
            ->withSum('entries', 'amount')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/budgets/index', [
            'budgets' => $budgets,
            'filters' => $request->only(['per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/budgets/form', $this->formData($request));
    }

    public function entries(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $entries = BudgetEntry::query()
            ->where('organization_id', $organizationId)
            ->with(['budget', 'account', 'costCenter', 'fiscalPeriod'])
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/budgets/entries', [
            'entries' => $entries,
            'filters' => $request->only(['per_page', 'page']),
        ]);
    }

    public function store(StoreBudgetRequest $request)
    {
        try {
            $data = $request->validated();
            $data['organization_id'] = $request->attributes->get('active_organization')->id;
            $this->budgetService->create($data);
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('budgets.index')->with('success', 'Budget created successfully.');
    }

    public function show(Request $request, Budget $budget): Response
    {
        $this->authorizeOrganization($request, $budget);

        return Inertia::render('general-accounting/budgets/show', [
            'budget' => $budget->load(['fiscalYear', 'entries.account', 'entries.costCenter', 'entries.fiscalPeriod']),
        ]);
    }

    public function edit(Request $request, Budget $budget): Response
    {
        $this->authorizeOrganization($request, $budget);

        return Inertia::render('general-accounting/budgets/form', [
            ...$this->formData($request),
            'budget' => $budget->load('entries'),
        ]);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        $this->authorizeOrganization($request, $budget);

        try {
            $this->budgetService->update($budget, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('budgets.index')->with('success', 'Budget updated successfully.');
    }

    public function destroy(Request $request, Budget $budget)
    {
        $this->authorizeOrganization($request, $budget);

        try {
            $this->budgetService->delete($budget);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('budgets.index')->with('success', 'Budget deleted successfully.');
    }

    public function activate(Request $request, Budget $budget)
    {
        $this->authorizeOrganization($request, $budget);

        try {
            $this->budgetService->activate($budget);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Budget activated successfully.');
    }

    public function close(Request $request, Budget $budget)
    {
        $this->authorizeOrganization($request, $budget);

        try {
            $this->budgetService->close($budget);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Budget closed successfully.');
    }

    public function budgetVsActual(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $budgetId = $request->integer('budget_id') ?: null;
        $periodId = $request->integer('fiscal_period_id') ?: null;

        $budgetRows = DB::table('budget_entries as be')
            ->join('budgets as b', 'b.id', '=', 'be.budget_id')
            ->join('accounts as a', 'a.id', '=', 'be.account_id')
            ->leftJoin('cost_centers as cc', 'cc.id', '=', 'be.cost_center_id')
            ->leftJoin('fiscal_periods as fp', 'fp.id', '=', 'be.fiscal_period_id')
            ->where('be.organization_id', $organizationId)
            ->whereIn('b.status', ['ACTIVE', 'CLOSED'])
            ->when($budgetId, fn($query) => $query->where('b.id', $budgetId))
            ->when($periodId, fn($query) => $query->where('be.fiscal_period_id', $periodId))
            ->groupBy('b.id', 'b.name', 'a.id', 'a.code', 'a.name', 'cc.id', 'cc.code', 'cc.name', 'fp.id', 'fp.name')
            ->get([
                'b.id as budget_id',
                'b.name as budget_name',
                'a.id as account_id',
                'a.code as account_code',
                'a.name as account_name',
                'cc.id as cost_center_id',
                'cc.code as cost_center_code',
                'cc.name as cost_center_name',
                'fp.id as fiscal_period_id',
                'fp.name as fiscal_period_name',
                DB::raw('SUM(be.amount) as budget_amount'),
            ]);

        $actuals = DB::table('voucher_entries as ve')
            ->join('vouchers as v', 'v.id', '=', 've.voucher_id')
            ->where('v.organization_id', $organizationId)
            ->where('v.status', 'POSTED')
            ->when($periodId, fn($query) => $query->where('v.fiscal_period_id', $periodId))
            ->groupBy('ve.account_id', 've.cost_center_id', 'v.fiscal_period_id')
            ->get(['ve.account_id', 've.cost_center_id', 'v.fiscal_period_id', DB::raw('SUM(ve.debit - ve.credit) as actual_amount')])
            ->keyBy(fn($row) => implode(':', [$row->account_id, $row->cost_center_id ?? '', $row->fiscal_period_id ?? '']));

        $rows = $budgetRows->map(function ($row) use ($actuals) {
            $key = implode(':', [$row->account_id, $row->cost_center_id ?? '', $row->fiscal_period_id ?? '']);
            $row->budget_amount = (float) $row->budget_amount;
            $row->actual_amount = (float) ($actuals[$key]->actual_amount ?? 0);
            $row->variance = $row->budget_amount - $row->actual_amount;
            $row->utilization = $row->budget_amount > 0 ? ($row->actual_amount / $row->budget_amount) * 100 : 0;
            return $row;
        });

        return Inertia::render('general-accounting/budgets/budget-vs-actual', [
            'rows' => $rows,
            'budgets' => $this->organizationQuery($request)->get(['id', 'name', 'fiscal_year_id']),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'filters' => $request->only(['budget_id', 'fiscal_period_id']),
        ]);
    }

    private function formData(Request $request): array
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return [
            'fiscalYears' => FiscalYear::query()->where('organization_id', $organizationId)->orderByDesc('start_date')->get(['id', 'name']),
            'fiscalPeriods' => $this->fiscalPeriods($request),
            'accounts' => LedgerAccount::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name']),
            'costCenters' => CostCenter::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name']),
        ];
    }

    private function fiscalPeriods(Request $request)
    {
        return FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $request->attributes->get('active_organization')->id))
            ->orderByDesc('start_date')
            ->get(['id', 'fiscal_year_id', 'name']);
    }

    private function organizationQuery(Request $request)
    {
        return Budget::query()->where('organization_id', $request->attributes->get('active_organization')->id);
    }

    private function authorizeOrganization(Request $request, Budget $budget): void
    {
        abort_unless($budget->organization_id === $request->attributes->get('active_organization')->id, 404);
    }
}
