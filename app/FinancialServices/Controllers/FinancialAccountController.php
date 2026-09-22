<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialAccountService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Requests\StoreFinancialAccountRequest;
use Carbon\CarbonImmutable;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function __construct(private readonly FinancialAccountService $accountService)
    {
        $this->middleware('permission:financial.accounts.view')->only(['index', 'show', 'statement']);
        $this->middleware('permission:financial.accounts.create')->only(['create', 'store']);
        $this->middleware('permission:financial.accounts.update')->only('activate');
        $this->middleware('permission:financial.accounts.close')->only('close');
    }

    public function index(Request $request): Response
    {
        return $this->accountIndex($request);
    }

    public function categoryIndex(Request $request, string $category): Response
    {
        abort_unless(in_array($category, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN'], true), 404);

        return $this->accountIndex($request, $category);
    }

    private function accountIndex(Request $request, ?string $category = null): Response
    {
        $accounts = $this->accountService
            ->queryForOrganization($this->organizationId($request))
            ->with(['product', 'holder'])
            ->when($category, fn($query) => $query->where('account_type', $category))
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
            'category' => $category,
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $category = $request->string('category')->upper()->value();
        $category = in_array($category, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN'], true)
            ? $category
            : null;

        return Inertia::render('financial-services/accounts/form', [
            'products' => FinancialProduct::query()->where('organization_id', $organizationId)->where('status', true)->when($category, fn($query) => $query->where('category', $category))->orderBy('code')->get(['id', 'code', 'name', 'category']),
            'customers' => Customer::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'customer_no', 'name', 'type', 'dob']),
            'category' => $category,
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
        $period = $request->string('period')->lower()->value() ?: 'monthly';
        abort_unless(in_array($period, ['monthly', 'quarterly', 'half_yearly', 'yearly'], true), 422);

        $statementDate = CarbonImmutable::parse(
            $request->input('date', now()->toDateString()),
        );
        [$periodStart, $periodEnd] = match ($period) {
            'quarterly' => [
                $statementDate->startOfQuarter()->startOfDay(),
                $statementDate->endOfQuarter()->endOfDay(),
            ],
            'half_yearly' => $statementDate->month <= 6
                ? [$statementDate->startOfYear()->startOfDay(), $statementDate->startOfYear()->addMonths(5)->endOfMonth()->endOfDay()]
                : [$statementDate->startOfYear()->addMonths(6)->startOfDay(), $statementDate->endOfYear()->endOfDay()],
            'yearly' => [
                $statementDate->startOfYear()->startOfDay(),
                $statementDate->endOfYear()->endOfDay(),
            ],
            default => [
                $statementDate->startOfMonth()->startOfDay(),
                $statementDate->endOfMonth()->endOfDay(),
            ],
        };

        $accounts = $this->accountService
            ->queryForOrganization($this->organizationId($request))
            ->orderBy('account_no')
            ->get(['id', 'account_no', 'name', 'account_type']);

        $account = null;
        $totals = ['debit' => 0, 'credit' => 0, 'count' => 0];

        if ($request->integer('account_id')) {
            $account = $this->accountService
                ->queryForOrganization($this->organizationId($request))
                ->find($request->integer('account_id'));

            if ($account) {
                $transactions = $account->transactions()
                    ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                    ->with('entries')
                    ->latest('transaction_date')
                    ->get();

                $account->setRelation('transactions', $transactions);
                $totals = [
                    'debit' => $transactions->flatMap->entries
                        ->where('direction', 'DEBIT')
                        ->sum('amount'),
                    'credit' => $transactions->flatMap->entries
                        ->where('direction', 'CREDIT')
                        ->sum('amount'),
                    'count' => $transactions->count(),
                ];
            }
        }

        return Inertia::render('financial-services/accounts/statement', [
            'accounts' => $accounts,
            'account' => $account,
            'period' => $period,
            'statementDate' => $statementDate->toDateString(),
            'periodStart' => $periodStart->toDateString(),
            'periodEnd' => $periodEnd->toDateString(),
            'totals' => $totals,
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