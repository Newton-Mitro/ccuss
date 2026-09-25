<?php

namespace App\TreasuryAndCash\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashAdjustmentService;
use App\TreasuryAndCash\Application\CashMovementDataService;
use App\TreasuryAndCash\Application\CashTransferService;
use App\TreasuryAndCash\Application\ChequeService;
use App\TreasuryAndCash\Application\TellerCashTransactionService;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Requests\StoreCashAdjustmentRequest;
use App\TreasuryAndCash\Requests\StoreCashTransferRequest;
use App\TreasuryAndCash\Requests\StoreTellerCashTransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CashMovementController extends Controller
{
    public function __construct(
        private readonly CashMovementDataService $cashMovementDataService,
        private readonly CashTransferService $cashTransferService,
        private readonly CashAdjustmentService $cashAdjustmentService,
        private readonly TellerCashTransactionService $tellerCashTransactionService,
    ) {
        $this->middleware('permission:cash_transactions.create')->only([
            'tellerCashAdjustment',
            'storeTellerCashAdjustment',
            'deposit',
            'withdrawal',
            'storeDeposit',
            'storeWithdrawal',
        ]);
        $this->middleware('permission:cash_transfers.create')
            ->only(['tellerToTellerTransfer', 'storeTellerToTellerTransfer']);
        $this->middleware('permission:cash_transfers.view')->only(['cashTransfers']);
        $this->middleware('permission:cash_transfers.approve')->only(['approveCashTransfer']);
        $this->middleware('permission:cash_transfers.complete')->only(['completeCashTransfer']);
        $this->middleware('permission:cash_transactions.view')->only(['tellerCashTransactions']);
        $this->middleware('permission:cash_transactions.post')->only(['postTellerCashTransaction']);
        $this->middleware('permission:cash_transactions.view')->only(['cashAdjustments']);
        $this->middleware('permission:cash_transactions.post')->only(['approveCashAdjustment', 'postCashAdjustment']);
    }

    public function tellerCashTransactions(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        return Inertia::render('treasury-cash/teller-transactions/index', [
            'transactions' => $this->cashMovementDataService->listTellerCashTransactions(
                $organization->id,
                $user->branch_id,
                $request->input('search'),
                $request->input('per_page', 18),
            ),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function cashAdjustments(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash adjustments.');

        return Inertia::render('treasury-cash/cash-adjustments/index', [
            'adjustments' => $this->cashMovementDataService->listCashAdjustments(
                $organization->id,
                $user->branch_id,
                $request->input('search'),
                $request->input('per_page', 18),
            ),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function approveCashAdjustment(Request $request, CashAdjustment $adjustment): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash adjustments.');

        try {
            $this->cashAdjustmentService->approve($organization->id, $user->branch_id, $user->id, $adjustment->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('cash-adjustments.index')
            ->with('success', 'Cash adjustment approved successfully.');
    }

    public function postCashAdjustment(Request $request, CashAdjustment $adjustment): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash adjustments.');

        try {
            $this->cashAdjustmentService->post($organization->id, $user->branch_id, $adjustment->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('cash-adjustments.index')
            ->with('success', 'Cash adjustment posted successfully.');
    }

    public function postTellerCashTransaction(Request $request, TellerCashTransaction $transaction): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        try {
            $this->tellerCashTransactionService->post(
                $organization->id,
                $user->branch_id,
                $user->id,
                $transaction->id,
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('teller-transactions.index')
            ->with('success', 'Teller transaction posted successfully.');
    }

    public function tellerToTellerTransfer(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        return Inertia::render(
            'treasury-cash/cash-movements/teller-to-teller-transfer',
            $this->cashMovementDataService->forTellerTransfer($organization->id, $user->branch_id),
        );
    }

    public function cashTransfers(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        return Inertia::render('treasury-cash/cash-movements/index', [
            'transfers' => $this->cashMovementDataService->listCashTransfers(
                $organization->id,
                $user->branch_id,
                $request->input('search'),
                $request->input('per_page', 18),
            ),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function approveCashTransfer(Request $request, CashTransfer $transfer): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        try {
            $this->cashTransferService->approve($organization->id, $user->branch_id, $user->id, $transfer->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('cash-movements.transfers.index')
            ->with('success', 'Cash transfer approved successfully.');
    }

    public function completeCashTransfer(Request $request, CashTransfer $transfer): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        try {
            $this->cashTransferService->complete($organization->id, $user->branch_id, $transfer->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('cash-movements.transfers.index')
            ->with('success', 'Cash transfer completed successfully.');
    }

    public function storeTellerToTellerTransfer(StoreCashTransferRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        try {
            $transfer = $this->cashTransferService->create(
                $organization->id,
                $user->branch_id,
                $user->id,
                $request->validated(),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('cash-movements.teller-to-teller-transfer')
            ->with('success', "Cash transfer {$transfer->transfer_no} created successfully.");
    }

    public function tellerCashAdjustment(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash adjustments.');

        return Inertia::render(
            'treasury-cash/cash-adjustments/teller-cash-adjustment',
            $this->cashMovementDataService->forAdjustment($organization->id, $user->branch_id),
        );
    }

    public function storeTellerCashAdjustment(StoreCashAdjustmentRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash adjustments.');

        try {
            $this->cashAdjustmentService->create(
                $organization->id,
                $user->branch_id,
                $user->id,
                $request->validated(),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('cash-adjustments.teller-cash-adjustment')
            ->with('success', 'Cash adjustment created successfully.');
    }

    public function customerDeposit(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        $selectedCustomer = null;
        $customerAccounts = collect([]);
        $obligations = [];
        $totals = [
            'current_due' => 0,
            'previous_due' => 0,
            'total_due' => 0,
        ];

        $customerId = $request->query('customer_id');
        if ($customerId) {
            $selectedCustomer = Customer::query()
                ->where('organization_id', $organization->id)
                ->with('photo')
                ->find($customerId);

            if ($selectedCustomer) {
                $customerAccounts = FinancialAccount::query()
                    ->where('organization_id', $organization->id)
                    ->where('holder_type', Customer::class)
                    ->where('holder_id', $selectedCustomer->id)
                    ->with(['product', 'loanAccount', 'shareAccount', 'recurringDeposit'])
                    ->orderBy('account_no')
                    ->get();

                $customerAccounts = $customerAccounts
                    ->filter(fn(FinancialAccount $account) => in_array($account->account_type, ['SAVINGS', 'SHARE', 'RECURRING_DEPOSIT', 'LOAN'], true))
                    ->values();

                $obligations = $this->buildCustomerDepositObligations($customerAccounts);
                $totals = [
                    'current_due' => collect($obligations)->where('month', 'Current month')->sum('amount'),
                    'previous_due' => collect($obligations)->where('month', 'Previous month')->sum('amount'),
                    'total_due' => collect($obligations)->sum('amount'),
                ];
            }
        }

        return Inertia::render('treasury-cash/teller-deposits/customer-deposit-page', [
            'customer' => $selectedCustomer,
            'customerAccounts' => $customerAccounts->map(fn(FinancialAccount $account) => [
                'id' => $account->id,
                'account_type' => $account->account_type,
                'account_no' => $account->account_no,
                'name' => $account->name,
                'balance' => (float) $account->balance,
                'available_balance' => (float) $account->available_balance,
            ])->all(),
            'obligations' => $obligations,
            'totals' => $totals,
            'teller_sessions' => TellerSession::query()
                ->where('status', 'OPEN')
                ->whereHas('branchDay', function ($branchDay) use ($organization, $user) {
                    $branchDay
                        ->where('organization_id', $organization->id)
                        ->where('branch_id', $user->branch_id)
                        ->where('status', 'OPEN');
                })
                ->with(['teller', 'branchDay'])
                ->latest('opened_at')
                ->get(['id', 'branch_day_id', 'teller_id', 'opening_cash', 'expected_cash']),
            'filters' => $request->only(['customer_id']),
        ]);
    }

    public function storeCustomerDeposit(Request $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        $data = $request->validate([
            'teller_session_id' => ['required', 'integer', 'exists:teller_sessions,id'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'selected' => ['required', 'array', 'min:1'],
            'selected.*' => ['string'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $customer = Customer::query()
            ->where('organization_id', $organization->id)
            ->findOrFail($data['customer_id']);

        $session = TellerSession::query()
            ->whereKey($data['teller_session_id'])
            ->where('status', 'OPEN')
            ->whereHas('branchDay', function ($branchDay) use ($organization, $user) {
                $branchDay
                    ->where('organization_id', $organization->id)
                    ->where('branch_id', $user->branch_id)
                    ->where('status', 'OPEN');
            })
            ->with(['teller.cashLocation.financialAccount'])
            ->firstOrFail();

        $customerAccounts = FinancialAccount::query()
            ->where('organization_id', $organization->id)
            ->where('holder_type', Customer::class)
            ->where('holder_id', $customer->id)
            ->with(['product', 'loanAccount', 'shareAccount', 'recurringDeposit'])
            ->orderBy('account_no')
            ->get();

        $customerAccounts = $customerAccounts
            ->filter(fn(FinancialAccount $account) => in_array($account->account_type, ['SAVINGS', 'SHARE', 'RECURRING_DEPOSIT', 'LOAN'], true))
            ->values();

        $selectedObligations = collect($this->buildCustomerDepositObligations($customerAccounts))
            ->keyBy('id')
            ->only($data['selected'])
            ->values();

        if ($selectedObligations->isEmpty()) {
            throw ValidationException::withMessages([
                'selected' => ['The selected obligations do not belong to this customer.'],
            ]);
        }

        $selectedTotal = (float) $selectedObligations->sum('amount');
        if ((float) $data['amount'] > $selectedTotal + 0.0001) {
            throw ValidationException::withMessages([
                'amount' => ['The payment amount cannot exceed the selected obligations total.'],
            ]);
        }

        $lines = $selectedObligations
            ->map(fn(array $obligation): array => [
                'financial_account_id' => (int) $obligation['account_id'],
                'amount' => (string) number_format((float) $obligation['amount'], 4, '.', ''),
                'description' => $obligation['due_type'] . ' - ' . $obligation['month'],
            ])
            ->all();

        $this->tellerCashTransactionService->create(
            $organization->id,
            $user->branch_id,
            $user->id,
            'DEPOSIT',
            [
                'teller_session_id' => $session->id,
                'amount' => number_format((float) $data['amount'], 4, '.', ''),
                'reference' => 'CUST-DEP-' . $customer->customer_no,
                'note' => $data['note'] ?? 'Customer deposit',
                'lines' => $lines,
            ],
        );

        return redirect()
            ->route('teller-transactions.customer-deposit', ['customer_id' => $customer->id])
            ->with('success', 'Customer deposit posted for ' . $customer->name . '.');
    }

    public function savingsChequeWithdrawal(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        $selectedCustomer = null;
        $savingsAccounts = collect([]);
        $availableCheques = collect([]);

        $customerId = $request->query('customer_id');
        if ($customerId) {
            $selectedCustomer = Customer::query()
                ->where('organization_id', $organization->id)
                ->with('photo')
                ->find($customerId);

            if ($selectedCustomer) {
                $savingsAccounts = FinancialAccount::query()
                    ->where('organization_id', $organization->id)
                    ->where('holder_type', Customer::class)
                    ->where('holder_id', $selectedCustomer->id)
                    ->where('account_type', 'SAVINGS')
                    ->with(['product', 'chequeBooks.cheques' => fn($query) => $query->whereIn('status', ['UNUSED', 'ISSUED'])->orderBy('cheque_no')])
                    ->orderBy('account_no')
                    ->get();

                $availableCheques = $savingsAccounts
                    ->flatMap(fn(FinancialAccount $account) => $account->chequeBooks
                        ->flatMap(fn($book) => $book->cheques->map(fn($cheque) => [
                            'id' => $cheque->id,
                            'financial_account_id' => $account->id,
                            'cheque_book_id' => $book->id,
                            'cheque_no' => $cheque->cheque_no,
                            'status' => $cheque->status,
                            'amount' => (float) ($cheque->amount ?? 0),
                            'payee' => $cheque->payee,
                            'issue_date' => $cheque->issue_date?->toDateString(),
                        ])))
                    ->values();
            }
        }

        return Inertia::render('treasury-cash/teller-transactions/savings-cheque-withdrawal-page', [
            'customer' => $selectedCustomer,
            'savings_accounts' => $savingsAccounts->map(fn(FinancialAccount $account) => [
                'id' => $account->id,
                'account_type' => $account->account_type,
                'account_no' => $account->account_no,
                'name' => $account->name,
                'balance' => (float) $account->balance,
                'available_balance' => (float) $account->available_balance,
            ])->all(),
            'available_cheques' => $availableCheques->all(),
            'teller_sessions' => TellerSession::query()
                ->where('status', 'OPEN')
                ->whereHas('branchDay', function ($branchDay) use ($organization, $user) {
                    $branchDay
                        ->where('organization_id', $organization->id)
                        ->where('branch_id', $user->branch_id)
                        ->where('status', 'OPEN');
                })
                ->with(['teller', 'branchDay'])
                ->latest('opened_at')
                ->get(['id', 'branch_day_id', 'teller_id', 'opening_cash', 'expected_cash']),
        ]);
    }

    public function storeSavingsChequeWithdrawal(Request $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        $data = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'teller_session_id' => ['required', 'integer', 'exists:teller_sessions,id'],
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'cheque_id' => ['required', 'integer', 'exists:cheques,id'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $customer = Customer::query()->where('organization_id', $organization->id)->findOrFail($data['customer_id']);
        $account = FinancialAccount::query()->where('organization_id', $organization->id)->where('id', $data['financial_account_id'])->firstOrFail();
        $cheque = Cheque::query()->whereKey($data['cheque_id'])->where('financial_account_id', $account->id)->firstOrFail();

        $session = TellerSession::query()
            ->whereKey($data['teller_session_id'])
            ->where('status', 'OPEN')
            ->whereHas('branchDay', fn($query) => $query->where('organization_id', $organization->id)->where('branch_id', $user->branch_id)->where('status', 'OPEN'))
            ->with(['teller.cashLocation.financialAccount'])
            ->firstOrFail();

        app(ChequeService::class)->withdrawFromTeller(
            $cheque,
            $session->id,
            $organization->id,
            $user->branch_id,
            $user->id,
        );

        return redirect()->route('teller-transactions.savings-cheque-withdrawal', ['customer_id' => $customer->id])
            ->with('success', 'Savings cheque withdrawal posted successfully.');
    }

    public function deposit(Request $request): Response
    {
        return $this->tellerCashTransactionForm($request, 'DEPOSIT');
    }

    public function withdrawal(Request $request): Response
    {
        return $this->tellerCashTransactionForm($request, 'WITHDRAWAL');
    }

    public function storeDeposit(StoreTellerCashTransactionRequest $request): RedirectResponse
    {
        return $this->storeTellerCashTransaction($request, 'DEPOSIT', 'deposit');
    }

    public function storeWithdrawal(StoreTellerCashTransactionRequest $request): RedirectResponse
    {
        return $this->storeTellerCashTransaction($request, 'WITHDRAWAL', 'withdrawal');
    }

    private function tellerCashTransactionForm(Request $request, string $type): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        return Inertia::render('treasury-cash/teller-transactions/form', [
            ...$this->cashMovementDataService->forTellerCashTransaction($organization->id, $user->branch_id),
            'transaction_type' => $type,
        ]);
    }

    private function buildCustomerDepositObligations($customerAccounts): array
    {
        $rows = [];

        foreach ($customerAccounts as $account) {
            if ($account->account_type === 'LOAN' && $account->loanAccount) {
                $principal = (float) ($account->loanAccount->principal_amount ?: $account->balance ?: 0);
                $rate = (float) ($account->loanAccount->contractual_rate ?: 0.12);
                $dailyInterest = $principal * $rate / 365;
                $currentMonthDue = round($dailyInterest * 30, 2);
                $previousDue = round($dailyInterest * 45, 2);

                $rows[] = [
                    'id' => 'loan-interest-' . $account->id,
                    'account_id' => $account->id,
                    'account_type' => 'LOAN',
                    'due_type' => 'Loan interest',
                    'month' => 'Current month',
                    'amount' => $currentMonthDue,
                ];
                $rows[] = [
                    'id' => 'loan-interest-prev-' . $account->id,
                    'account_id' => $account->id,
                    'account_type' => 'LOAN',
                    'due_type' => 'Loan interest',
                    'month' => 'Previous month',
                    'amount' => $previousDue,
                ];

                $protectionFee = 125;
                $renewalFee = 50;
                $fineAmount = 0;

                $rows[] = [
                    'id' => 'protection-fee-' . $account->id,
                    'account_id' => $account->id,
                    'account_type' => 'LOAN',
                    'due_type' => 'Loan protection fee',
                    'month' => 'Current month',
                    'amount' => $protectionFee,
                ];
                $rows[] = [
                    'id' => 'renewal-fee-' . $account->id,
                    'account_id' => $account->id,
                    'account_type' => 'LOAN',
                    'due_type' => 'Loan protection renew fee',
                    'month' => 'Current month',
                    'amount' => $renewalFee,
                ];
                $rows[] = [
                    'id' => 'fine-' . $account->id,
                    'account_id' => $account->id,
                    'account_type' => 'LOAN',
                    'due_type' => 'Loan fine',
                    'month' => 'Previous month',
                    'amount' => $fineAmount,
                ];
            }

            if ($account->account_type === 'SAVINGS' || $account->account_type === 'SHARE' || $account->account_type === 'RECURRING_DEPOSIT') {
                $depositDue = max(0, (float) $account->balance * 0.01);
                $rows[] = [
                    'id' => 'deposit-' . $account->id,
                    'account_id' => $account->id,
                    'account_type' => $account->account_type,
                    'due_type' => 'Deposit contribution',
                    'month' => 'Current month',
                    'amount' => round($depositDue, 2),
                ];
            }
        }

        return $rows;
    }

    private function storeTellerCashTransaction(
        StoreTellerCashTransactionRequest $request,
        string $type,
        string $routeType,
    ): RedirectResponse {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        try {
            $transaction = $this->tellerCashTransactionService->create(
                $organization->id,
                $user->branch_id,
                $user->id,
                $type,
                $request->validated(),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('teller-transactions.' . $routeType)
            ->with('success', "Teller transaction {$transaction->transaction_no} created successfully.");
    }
}
