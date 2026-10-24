<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\DividendService;
use App\FinancialServices\Models\ShareDividendAllocation;
use App\FinancialServices\Models\ShareDividendDeclaration;
use App\GeneralAccounting\Models\FiscalYear;
use App\Http\Controllers\Controller;
use App\SystemAdministration\Application\ApprovalNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DividendController extends Controller
{
    public function __construct(
        private readonly DividendService $service,
        private readonly ApprovalNotificationService $approvalNotifications,
    ) {
        $this->middleware('permission:financial.accounts.view,financial.view')->only('index');
        $this->middleware('permission:financial.transactions.create')->only(['create', 'store', 'calculate']);
        $this->middleware('permission:financial.transactions.post')->only(['approve', 'post']);
    }

    public function index(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $query = ShareDividendDeclaration::query()
            ->where('organization_id', $organizationId)
            ->with('allocations')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->where(fn ($query) => $query
                    ->where('declaration_no', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%"));
            })
            ->latest('id');

        return Inertia::render('financial-services/dividends/index', [
            'declarations' => $query->paginate($request->integer('per_page', 20))->withQueryString(),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/dividends/create', [
            'fiscalYears' => FiscalYear::query()
                ->where('organization_id', $organizationId)
                ->whereIn('status', ['OPEN', 'CLOSED'])
                ->orderByDesc('start_date')
                ->get(['id', 'name', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['fiscal_year_id' => ['required', 'integer', 'exists:fiscal_years,id'], 'dividend_rate' => ['required', 'numeric', 'gte:0'], 'declaration_date' => ['nullable', 'date'], 'note' => ['nullable', 'string', 'max:2000']]);
        $declaration = $this->service->createDeclaration($data, $this->organizationId($request));
        $this->approvalNotifications->notifyOrganizationUsers(
            $this->organizationId($request),
            ['financial.transactions.post'],
            $request->user()->id,
            'Dividend declaration awaiting approval',
            "Dividend declaration {$declaration->declaration_no} is ready for approval.",
            route('dividends.index', [], false),
            'approval.requested',
        );

        return redirect()->route('dividends.index')->with('success', 'Dividend declaration created.');
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
        $this->approvalNotifications->notifyOrganizationUsers(
            $this->organizationId($request),
            ['financial.transactions.create', 'financial.transactions.post'],
            $request->user()->id,
            'Dividend declaration approved',
            "Dividend declaration {$shareDividendDeclaration->declaration_no} has been approved.",
            route('dividends.index', [], false),
            'approval.approved',
        );

        return back()->with('success', 'Dividend declaration approved.');
    }

    public function post(Request $request, ShareDividendAllocation $shareDividendAllocation)
    {
        $shareDividendAllocation->load('declaration');
        abort_unless($shareDividendAllocation->declaration->organization_id === $this->organizationId($request), 404);
        $transaction = $this->service->createPosting($shareDividendAllocation, $this->organizationId($request), $request->user()->id);

        return redirect()->route('financial-transactions.show', $transaction)->with('success', 'Dividend allocation posting created.');
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
