<?php

namespace App\FinancialServices\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialAccountService;
use App\FinancialServices\Application\FixedDepositService;
use App\FinancialServices\Application\RecurringDepositService;
use App\FinancialServices\Models\RecurringDeposit;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\DepositNominee;
use App\FinancialServices\Models\ShareAccount;
use App\FinancialServices\Requests\StoreFinancialAccountRequest;
use App\FinancialServices\Requests\StoreDepositNomineeRequest;
use App\FinancialServices\Requests\StoreFinancialAccountHolderRequest;
use App\FinancialServices\Requests\StoreShareAccountRequest;
use App\FinancialServices\Requests\StoreFixedDepositRequest;
use App\FinancialServices\Requests\StoreRecurringDepositRequest;
use App\FinancialServices\Requests\StoreRecurringDepositPaymentRequest;
use Carbon\CarbonImmutable;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function __construct(
        private readonly FinancialAccountService $accountService,
        private readonly FixedDepositService $fixedDepositService,
        private readonly RecurringDepositService $recurringDepositService,
    ) {
        $this->middleware('permission:financial.accounts.view')->only(['index', 'show', 'statement']);
        $this->middleware('permission:financial.accounts.create')->only(['create', 'store']);
        $this->middleware('permission:financial.accounts.update')->only('activate');
        $this->middleware('permission:financial.accounts.close')->only('close');
        $this->middleware('permission:financial.accounts.nominees.manage')->only(['storeNominee', 'updateNominee', 'destroyNominee']);
        $this->middleware('permission:financial.accounts.holders.manage')->only(['storeHolder', 'updateHolder', 'destroyHolder']);
        $this->middleware('permission:financial.accounts.membership.manage')->only(['storeShareAccount', 'updateShareAccount']);
        $this->middleware('permission:financial.accounts.fixed-deposits.manage')->only('storeFixedDeposit');
        $this->middleware('permission:financial.accounts.recurring-deposits.manage')->only('storeRecurringDeposit');
        $this->middleware('permission:financial.accounts.recurring-deposits.manage')->only(['markRecurringInstallmentMissed', 'waiveRecurringInstallment']);
        $this->middleware('permission:financial.accounts.recurring-deposits.manage')->only('payRecurringInstallment');
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
            'customers' => Customer::query()
                ->where('organization_id', $this->organizationId($request))
                ->orderBy('name')
                ->get(['id', 'customer_no', 'name', 'type', 'dob']),
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

    public function storeHolder(StoreFinancialAccountHolderRequest $request, FinancialAccount $financialAccount)
    {
        $this->authorizeHolderAccount($request, $financialAccount);
        $holder = Customer::query()->where('organization_id', $this->organizationId($request))->findOrFail($request->integer('customer_id'));
        $this->validateHolderAllocation($request, $financialAccount);
        $financialAccount->addHolder($holder, $request->string('role')->value(), $this->guardian($request), (float) $request->input('ownership_percent'));
        $this->ensurePrimaryHolder($financialAccount, $holder, $request->string('role')->value());

        return back()->with('success', 'Account holder added successfully.');
    }

    public function updateHolder(StoreFinancialAccountHolderRequest $request, FinancialAccount $financialAccount, Customer $holder)
    {
        $this->authorizeHolderAccount($request, $financialAccount);
        abort_unless($financialAccount->holders()->whereKey($holder->id)->exists(), 404);
        $this->validateHolderAllocation($request, $financialAccount, $holder);
        $role = $request->string('role')->value();
        $financialAccount->addHolder($holder, $role, $this->guardian($request), (float) $request->input('ownership_percent'));
        $this->ensurePrimaryHolder($financialAccount, $holder, $role);

        return back()->with('success', 'Account holder updated successfully.');
    }

    public function destroyHolder(Request $request, FinancialAccount $financialAccount, Customer $holder)
    {
        $this->authorizeHolderAccount($request, $financialAccount);
        abort_unless($financialAccount->holders()->whereKey($holder->id)->exists(), 404);
        abort_if($financialAccount->holders()->wherePivot('role', 'PRIMARY')->whereKey($holder->id)->exists(), 422, 'The primary holder cannot be removed.');
        $financialAccount->holders()->detach($holder->id);

        return back()->with('success', 'Account holder removed successfully.');
    }

    public function storeShareAccount(StoreShareAccountRequest $request, FinancialAccount $financialAccount)
    {
        $this->authorizeShareAccount($request, $financialAccount);
        abort_if($financialAccount->shareAccount()->exists(), 422, 'This share account already has membership details.');
        $customerId = (int) $financialAccount->holder_id;
        $membershipNo = $request->input('membership_no') ?: 'MEM-' . str_pad((string) $financialAccount->id, 8, '0', STR_PAD_LEFT);
        abort_if(ShareAccount::query()->where('membership_no', $membershipNo)->exists(), 422, 'The membership number is already in use.');

        $financialAccount->shareAccount()->create([
            ...$request->validated(),
            'customer_id' => $customerId,
            'membership_no' => $membershipNo,
        ]);

        return back()->with('success', 'Share membership registered successfully.');
    }

    public function updateShareAccount(StoreShareAccountRequest $request, FinancialAccount $financialAccount, ShareAccount $shareAccount)
    {
        $this->authorizeShareAccount($request, $financialAccount);
        abort_unless($shareAccount->financial_account_id === $financialAccount->id, 404);
        $membershipNo = $request->input('membership_no') ?: $shareAccount->membership_no;
        abort_if(ShareAccount::query()->where('membership_no', $membershipNo)->whereKeyNot($shareAccount->id)->exists(), 422, 'The membership number is already in use.');
        $shareAccount->update([...$request->validated(), 'membership_no' => $membershipNo]);

        return back()->with('success', 'Share membership updated successfully.');
    }

    public function storeFixedDeposit(StoreFixedDepositRequest $request, FinancialAccount $financialAccount)
    {
        $this->authorizeOrganization($request, $financialAccount);
        $this->fixedDepositService->open($financialAccount, $request->validated());

        return back()->with('success', 'Fixed-deposit contract opened successfully.');
    }

    public function storeRecurringDeposit(StoreRecurringDepositRequest $request, FinancialAccount $financialAccount)
    {
        $this->authorizeOrganization($request, $financialAccount);
        $this->recurringDepositService->open($financialAccount, $request->validated());

        return back()->with('success', 'Recurring-deposit contract opened successfully.');
    }

    public function markRecurringInstallmentMissed(Request $request, FinancialAccount $financialAccount, RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment)
    {
        $this->authorizeRecurringInstallment($request, $financialAccount, $recurringDeposit);
        $this->recurringDepositService->markMissed($recurringDeposit, $installment);

        return back()->with('success', 'Installment marked missed.');
    }

    public function waiveRecurringInstallment(Request $request, FinancialAccount $financialAccount, RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment)
    {
        $this->authorizeRecurringInstallment($request, $financialAccount, $recurringDeposit);
        $this->recurringDepositService->waive($recurringDeposit, $installment);

        return back()->with('success', 'Installment waived.');
    }

    public function payRecurringInstallment(StoreRecurringDepositPaymentRequest $request, FinancialAccount $financialAccount, RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment)
    {
        $this->authorizeRecurringInstallment($request, $financialAccount, $recurringDeposit);
        $transaction = $this->recurringDepositService->collectPayment(
            $recurringDeposit,
            $installment,
            $request->validated(),
            $this->organizationId($request),
            $request->user()->id,
        );

        return redirect()->route('financial-transactions.show', $transaction)
            ->with('success', 'Recurring-deposit installment payment draft created.');
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

    private function authorizeHolderAccount(Request $request, FinancialAccount $account): void
    {
        $this->authorizeOrganization($request, $account);
        abort_unless(in_array($account->account_type, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true), 422, 'This account does not support holder maintenance.');
        abort_if($account->status === 'CLOSED', 422, 'Closed accounts cannot change holders.');
    }

    private function validateHolderAllocation(StoreFinancialAccountHolderRequest $request, FinancialAccount $account, ?Customer $current = null): void
    {
        $existingTotal = (float) $account->holders()
            ->when($current, fn($query) => $query->whereKeyNot($current->id))
            ->sum('ownership_percent');

        abort_if($existingTotal + (float) $request->input('ownership_percent') > 100, 422, 'Holder ownership percentages cannot exceed 100%.');
    }

    private function guardian(StoreFinancialAccountHolderRequest $request): ?Customer
    {
        $guardianId = $request->integer('guardian_customer_id');

        return $guardianId ? Customer::query()->where('organization_id', $this->organizationId($request))->findOrFail($guardianId) : null;
    }

    private function ensurePrimaryHolder(FinancialAccount $account, Customer $holder, string $role): void
    {
        if ($role === 'PRIMARY') {
            $account->holders()->whereKeyNot($holder->id)->update(['role' => 'JOINT']);
        }
    }

    private function authorizeShareAccount(Request $request, FinancialAccount $account): void
    {
        $this->authorizeOrganization($request, $account);
        abort_unless($account->account_type === 'SHARE', 422, 'Membership details are only available for share accounts.');
        abort_unless($account->holder_type === Customer::class && $account->holder_id, 422, 'A share account must have a customer holder.');
        abort_if($account->status === 'CLOSED', 422, 'Closed accounts cannot change membership details.');
    }

    private function authorizeRecurringInstallment(Request $request, FinancialAccount $account, RecurringDeposit $recurringDeposit): void
    {
        $this->authorizeOrganization($request, $account);
        abort_unless($account->account_type === 'RECURRING_DEPOSIT', 422, 'Installments are only available for recurring-deposit accounts.');
        abort_unless($recurringDeposit->financial_account_id === $account->id, 404);
        abort_if($account->status === 'CLOSED', 422, 'Closed accounts cannot change installments.');
    }
}