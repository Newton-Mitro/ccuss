<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialAccountService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\DepositNominee;
use App\FinancialServices\Requests\StoreFinancialAccountRequest;
use App\FinancialServices\Requests\StoreDepositNomineeRequest;
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
        $this->middleware('permission:financial.accounts.nominees.manage')->only(['storeNominee', 'updateNominee', 'destroyNominee']);
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
            'account' => $financialAccount->load([
                'product',
                'holder',
                'holders',
                'nominees',
                'shareAccount',
                'fixedDeposit',
                'recurringDeposit.installments',
                'loanAccount.schedules.components',
                'loanAccount.arrears',
                'transactions',
            ]),
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

    public function storeNominee(StoreDepositNomineeRequest $request, FinancialAccount $financialAccount)
    {
        $this->authorizeNomineeAccount($request, $financialAccount);
        $this->validateNomineeAllocation($request, $financialAccount);
        $nominee = $financialAccount->nominees()->create($request->validated());

        if ($nominee->is_primary) {
            $financialAccount->nominees()->whereKeyNot($nominee->id)->update(['is_primary' => false]);
        }

        return back()->with('success', 'Nominee added successfully.');
    }

    public function updateNominee(StoreDepositNomineeRequest $request, FinancialAccount $financialAccount, DepositNominee $nominee)
    {
        $this->authorizeNomineeAccount($request, $financialAccount);
        abort_unless($nominee->financial_account_id === $financialAccount->id, 404);
        $this->validateNomineeAllocation($request, $financialAccount, $nominee);
        $nominee->update($request->validated());

        if ($nominee->is_primary) {
            $financialAccount->nominees()->whereKeyNot($nominee->id)->update(['is_primary' => false]);
        }

        return back()->with('success', 'Nominee updated successfully.');
    }

    public function destroyNominee(Request $request, FinancialAccount $financialAccount, DepositNominee $nominee)
    {
        $this->authorizeNomineeAccount($request, $financialAccount);
        abort_unless($nominee->financial_account_id === $financialAccount->id, 404);
        $nominee->delete();

        return back()->with('success', 'Nominee removed successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, FinancialAccount $account): void
    {
        abort_unless($account->organization_id === $this->organizationId($request), 404);
    }

    private function authorizeNomineeAccount(Request $request, FinancialAccount $account): void
    {
        $this->authorizeOrganization($request, $account);
        abort_unless(in_array($account->account_type, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true), 422);
        abort_if($account->status === 'CLOSED', 422, 'Closed accounts cannot change nominees.');
    }

    private function validateNomineeAllocation(StoreDepositNomineeRequest $request, FinancialAccount $account, ?DepositNominee $current = null): void
    {
        $existingTotal = (float) $account->nominees()
            ->when($current, fn($query) => $query->whereKeyNot($current->id))
            ->sum('share_percent');

        abort_if($existingTotal + (float) $request->validated('share_percent') > 100, 422, 'Nominee share percentages cannot exceed 100%.');
    }
}