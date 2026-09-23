<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\DividendService;
use App\FinancialServices\Models\ShareDividendDeclaration;
use App\GeneralAccounting\Models\FiscalYear;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DividendController extends Controller
{
    public function __construct(private readonly DividendService $service)
    {
        $this->middleware('permission:financial.accounts.view')->only('index');
        $this->middleware('permission:financial.accounts.manage')->only(['store', 'calculate', 'approve']);
    }

    public function index(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/dividends/index', [
            'declarations' => ShareDividendDeclaration::query()->where('organization_id', $organizationId)->with('allocations')->latest('id')->paginate(20),
            'fiscalYears' => FiscalYear::query()->where('organization_id', $organizationId)->whereIn('status', ['OPEN', 'CLOSED'])->orderByDesc('start_date')->get(['id', 'name', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['fiscal_year_id' => ['required', 'integer', 'exists:fiscal_years,id'], 'dividend_rate' => ['required', 'numeric', 'gte:0'], 'declaration_date' => ['nullable', 'date'], 'note' => ['nullable', 'string', 'max:2000']]);
        $this->service->createDeclaration($data, $this->organizationId($request));

        return back()->with('success', 'Dividend declaration created.');
    }

    public function calculate(Request $request, ShareDividendDeclaration $shareDividendDeclaration)
    {
        $this->authorizeOrganization($request, $shareDividendDeclaration);
        $this->service->calculate($shareDividendDeclaration);

        return back()->with('success', 'Dividend allocations calculated.');
    }

    public function approve(Request $request, ShareDividendDeclaration $shareDividendDeclaration)
    {
        $this->authorizeOrganization($request, $shareDividendDeclaration);
        $this->service->approve($shareDividendDeclaration, $request->user()->id);

        return back()->with('success', 'Dividend declaration approved.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, ShareDividendDeclaration $declaration): void
    {
        abort_unless($declaration->organization_id === $this->organizationId($request), 404);
    }
}