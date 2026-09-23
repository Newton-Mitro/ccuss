<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\InterestProvisionService;
use App\FinancialServices\Models\InterestProvision;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InterestProvisionController extends Controller
{
    public function __construct(private readonly InterestProvisionService $service)
    {
        $this->middleware('permission:financial.accounts.view')->only('index');
        $this->middleware('permission:financial.accounts.manage')->only(['calculate', 'approve', 'reject']);
    }

    public function index(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/interest-provisions/index', [
            'provisions' => InterestProvision::query()
                ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $organizationId))
                ->with(['financialAccount:id,account_no,name', 'product:id,code,name'])
                ->latest('period_end')
                ->paginate($request->integer('per_page', 20))
                ->withQueryString(),
        ]);
    }

    public function calculate(Request $request)
    {
        $request->validate(['period_start' => ['required', 'date'], 'period_end' => ['required', 'date', 'after_or_equal:period_start']]);
        $this->service->calculateOrganization($this->organizationId($request), $request->string('period_start')->value(), $request->string('period_end')->value(), $request->user()->id);

        return back()->with('success', 'Interest provisions calculated successfully.');
    }

    public function approve(Request $request, InterestProvision $interestProvision)
    {
        $this->authorizeOrganization($request, $interestProvision);
        $this->service->approve($interestProvision, $request->user()->id);

        return back()->with('success', 'Interest provision approved.');
    }

    public function reject(Request $request, InterestProvision $interestProvision)
    {
        $this->authorizeOrganization($request, $interestProvision);
        $this->service->reject($interestProvision, $request->string('note')->value() ?: null);

        return back()->with('success', 'Interest provision rejected.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, InterestProvision $provision): void
    {
        abort_unless($provision->financialAccount()->where('organization_id', $this->organizationId($request))->exists(), 404);
    }
}