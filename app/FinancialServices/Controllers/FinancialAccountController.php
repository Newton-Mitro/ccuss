<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialAccountService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Requests\StoreFinancialAccountRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function __construct(private readonly FinancialAccountService $accountService)
    {
        $this->middleware('permission:financial.accounts.view')->only(['index', 'show']);
        $this->middleware('permission:financial.accounts.create')->only(['create', 'store']);
        $this->middleware('permission:financial.accounts.update')->only('activate');
        $this->middleware('permission:financial.accounts.close')->only('close');
    }

    public function index(Request $request): Response
    {
        $accounts = $this->accountService
            ->queryForOrganization($this->organizationId($request))
            ->with(['product', 'holder'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->where(fn($query) => $query
                    ->where('account_no', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%"));
            })
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/accounts/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/accounts/form', [
            'products' => FinancialProduct::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name', 'category']),
            'customers' => Customer::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'customer_no', 'name']),
        ]);
    }

    public function store(StoreFinancialAccountRequest $request)
    {
        $this->accountService->create($request->validated(), $this->organizationId($request));

        return redirect()->route('financial-accounts.index')->with('success', 'Financial account opened successfully.');
    }

    public function show(Request $request, FinancialAccount $financialAccount): Response
    {
        $this->authorizeOrganization($request, $financialAccount);

        return Inertia::render('financial-services/accounts/show', [
            'account' => $financialAccount->load(['product', 'holder', 'transactions']),
        ]);
    }

    public function statement(Request $request): Response
    {
        $accounts = $this->accountService
            ->queryForOrganization($this->organizationId($request))
            ->orderBy('account_no')
            ->get(['id', 'account_no', 'name', 'account_type']);

        $account = $request->integer('account_id')
            ? $this->accountService->queryForOrganization($this->organizationId($request))
                ->with('transactions')
                ->find($request->integer('account_id'))
            : null;

        return Inertia::render('financial-services/accounts/statement', [
            'accounts' => $accounts,
            'account' => $account,
        ]);
    }

    public function activate(Request $request, FinancialAccount $financialAccount)
    {
        $this->authorizeOrganization($request, $financialAccount);
        $this->accountService->activate($financialAccount);

        return back()->with('success', 'Financial account activated successfully.');
    }

    public function close(Request $request, FinancialAccount $financialAccount)
    {
        $this->authorizeOrganization($request, $financialAccount);
        $this->accountService->close($financialAccount);

        return back()->with('success', 'Financial account closed successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, FinancialAccount $account): void
    {
        abort_unless($account->organization_id === $this->organizationId($request), 404);
    }
}