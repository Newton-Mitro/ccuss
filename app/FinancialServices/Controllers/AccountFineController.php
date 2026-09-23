<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\DefaultFineService;
use App\FinancialServices\Models\AccountFine;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AccountFineController extends Controller
{
    public function __construct(private readonly DefaultFineService $service)
    {
        $this->middleware('permission:financial.accounts.view')->only('index');
        $this->middleware('permission:financial.accounts.manage')->only('waive');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('financial-services/fines/index', [
            'fines' => AccountFine::query()
                ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $this->organizationId($request)))
                ->with(['financialAccount:id,account_no,name', 'defaultEvent.rule:id,name'])
                ->latest('assessed_at')
                ->paginate($request->integer('per_page', 20))
                ->withQueryString(),
            'filters' => $request->only(['per_page', 'page']),
        ]);
    }

    public function waive(Request $request, AccountFine $accountFine)
    {
        $this->authorizeOrganization($request, $accountFine);
        $this->service->waiveFine($accountFine, $request->user()->id, $request->string('note')->value() ?: null);

        return Redirect::back()->with('success', 'Fine waived successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, AccountFine $fine): void
    {
        abort_unless($fine->financialAccount()->where('organization_id', $this->organizationId($request))->exists(), 404);
    }
}