<?php

namespace App\TreasuryAndCash\Controllers;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashAdjustmentService;
use App\TreasuryAndCash\Application\CashMovementDataService;
use App\TreasuryAndCash\Application\CashTransferService;
use App\TreasuryAndCash\Application\TellerCashTransactionService;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Requests\StoreCashAdjustmentRequest;
use App\TreasuryAndCash\Requests\StoreCashTransferRequest;
use App\TreasuryAndCash\Requests\StoreTellerCashTransactionRequest;
use Illuminate\Http\JsonResponse;
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
        $this->middleware('permission:cash_transactions.update')->only(['updateTellerCashTransaction']);
        $this->middleware('permission:cash_transactions.cancel')->only(['cancelTellerCashTransaction']);
        $this->middleware('permission:cash_transactions.post')->only(['postTellerCashTransaction']);
        $this->middleware('permission:cash_transactions.reverse')->only(['reverseTellerCashTransaction']);
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

    public function updateTellerCashTransaction(Request $request, TellerCashTransaction $transaction): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        $data = $request->validate([
            'reference' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $this->tellerCashTransactionService->updatePendingDetails(
                $organization->id,
                $user->branch_id,
                $transaction->id,
                $data['reference'] ?? null,
                $data['note'] ?? null,
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Teller transaction details updated successfully.');
    }

    public function cancelTellerCashTransaction(Request $request, TellerCashTransaction $transaction): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');
        $data = $request->validate(['reason' => ['required', 'string', 'max:2000']]);

        try {
            $this->tellerCashTransactionService->cancelPending(
                $organization->id,
                $user->branch_id,
                $user->id,
                $transaction->id,
                $data['reason'],
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pending teller transaction cancelled.');
    }

    public function reverseTellerCashTransaction(Request $request, TellerCashTransaction $transaction): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');
        $data = $request->validate(['reason' => ['required', 'string', 'max:2000']]);

        try {
            $this->tellerCashTransactionService->reversePosted(
                $organization->id,
                $user->branch_id,
                $user->id,
                $transaction->id,
                $data['reason'],
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Posted teller transaction reversed.');
    }

    public function tellerToTellerTransfer(Request $request, string $transferType = 'TELLER_TO_TELLER'): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        return Inertia::render(
            'treasury-cash/cash-movements/teller-to-teller-transfer',
            $this->cashMovementDataService->forCashTransfer(
                $organization->id,
                $user->branch_id,
                $transferType,
            ),
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
            $this->cashTransferService->complete($organization->id, $user->branch_id, $transfer->id, $user->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('cash-movements.transfers.index')
            ->with('success', 'Cash transfer completed successfully.');
    }

    public function storeTellerToTellerTransfer(
        StoreCashTransferRequest $request,
        string $transferType = 'TELLER_TO_TELLER',
    ): RedirectResponse {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for cash transfers.');

        try {
            $transfer = $this->cashTransferService->create(
                $organization->id,
                $user->branch_id,
                $user->id,
                $request->validated(),
                $transferType,
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        $routeName = match ($transferType) {
            'VAULT_TO_TELLER' => 'vault-transfers.root.vault-to-teller',
            'TELLER_TO_VAULT' => 'vault-transfers.root.teller-to-vault',
            'VAULT_TO_VAULT' => 'vault-transfers.root.vault-to-vault',
            'BANK_TO_VAULT' => 'vault-transfers.root.bank-to-vault',
            'VAULT_TO_BANK' => 'vault-transfers.root.vault-to-bank',
            default => 'cash-movements.teller-to-teller-transfer',
        };

        return redirect()
            ->route($routeName)
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

    public function searchCustomerDepositAccounts(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('active_organization');
        $search = trim((string) $request->query('search', ''));

        if (mb_strlen($search) < 2) {
            return response()->json([]);
        }

        $pattern = '%' . $search . '%';
        $scope = $request->query('scope', 'all');
        $accountTypes = [
            'deposit' => ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'],
            'loan' => ['LOAN'],
            'all' => null,
        ];

        $accountsQuery = FinancialAccount::query()
            ->where('organization_id', $organization->id)
            ->whereIn('status', ['PENDING', 'ACTIVE'])
            ->where(function ($query) use ($scope, $accountTypes): void {
                if (isset($accountTypes[$scope]) && $accountTypes[$scope] !== null) {
                    $query->whereIn('account_type', $accountTypes[$scope]);
                } elseif (in_array($scope, ['teller', 'vault', 'petty_cash'], true)) {
                    $query->whereExists(function ($locationQuery) use ($scope): void {
                        $locationQuery
                            ->selectRaw('1')
                            ->from('cash_locations')
                            ->whereColumn('cash_locations.financial_account_id', 'financial_accounts.id')
                            ->where('cash_locations.type', strtoupper(str_replace('_', '_', $scope)));
                    });
                } elseif ($scope === 'bank') {
                    $query->whereExists(function ($bankAccountQuery): void {
                        $bankAccountQuery
                            ->selectRaw('1')
                            ->from('bank_accounts')
                            ->whereColumn('bank_accounts.financial_account_id', 'financial_accounts.id');
                    });
                }
            })
            ->where(function ($query) use ($pattern): void {
                $query->where('account_no', 'like', $pattern)
                    ->orWhere('name', 'like', $pattern)
                    ->orWhereHasMorph('holder', [Customer::class], fn($customer) => $customer
                        ->where('name', 'like', $pattern)
                        ->orWhere('customer_no', 'like', $pattern))
                    ->orWhereHas('holders', fn($holder) => $holder
                        ->where('name', 'like', $pattern)
                        ->orWhere('customer_no', 'like', $pattern));
            })
            ->with(['holder', 'holders'])
            ->orderBy('account_no')
            ->limit(12);

        if ($scope === 'customer') {
            $accountsQuery
                ->where('holder_type', Customer::class)
                ->whereHas('customer');
        }

        $accounts = $accountsQuery->get();

        return response()->json(
            $accounts->map(fn(FinancialAccount $account) => $this->customerDepositAccountPayload($account))->all(),
        );
    }

    public function customerDeposit(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for teller transactions.');

        $selectedAccount = null;
        $accountId = $request->query('account_id');
        if ($accountId) {
            $selectedAccount = FinancialAccount::query()
                ->where('organization_id', $organization->id)
                ->where('holder_type', Customer::class)
                ->whereIn('account_type', ['SAVINGS', 'SHARE', 'RECURRING_DEPOSIT', 'LOAN'])
                ->with(['customer.photo', 'holders'])
                ->find($accountId);
        }

        $selectedCustomer = $selectedAccount?->customer;
        $customerAccounts = collect([]);
        $obligations = [];
        $totals = [
            'current_due' => 0,
            'previous_due' => 0,
            'total_due' => 0,
        ];

        $customerId = $selectedCustomer?->id ?? $request->query('customer_id');
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
                    ->with([
                        'product',
                        'loanAccount' => ['schedules.components', 'protectionPolicy', 'arrears'],
                        'shareAccount',
                        'recurringDeposit.installments',
                        'fines',
                    ])
                    ->orderBy('account_no')
                    ->get();

                $customerAccounts = $customerAccounts
                    ->filter(fn(FinancialAccount $account) => in_array($account->account_type, ['SAVINGS', 'SHARE', 'RECURRING_DEPOSIT', 'LOAN'], true))
                    ->values();

                $selectedAccount ??= $customerAccounts->first();
                $selectedAccount?->loadMissing(['customer.photo', 'holders']);

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
            'selectedAccount' => $selectedAccount
                ? $this->customerDepositAccountPayload($selectedAccount)
                : null,
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
            'account_id' => ['nullable', 'integer'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'selected' => ['required', 'array', 'min:1'],
            'selected.*' => ['string'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $customer = Customer::query()
            ->where('organization_id', $organization->id)
            ->findOrFail($data['customer_id']);

        $selectedAccount = null;
        if (!empty($data['account_id'])) {
            $selectedAccount = FinancialAccount::query()
                ->where('organization_id', $organization->id)
                ->where('holder_type', Customer::class)
                ->where('holder_id', $customer->id)
                ->whereIn('account_type', ['SAVINGS', 'SHARE', 'RECURRING_DEPOSIT', 'LOAN'])
                ->findOrFail($data['account_id']);
        }

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
            ->with([
                'product',
                'loanAccount' => ['schedules.components', 'protectionPolicy', 'arrears'],
                'shareAccount',
                'recurringDeposit.installments',
                'fines',
            ])
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

        $remainingAmount = round((float) $data['amount'], 4);
        $lines = $selectedObligations
            ->map(function (array $obligation) use (&$remainingAmount): ?array {
                if ($remainingAmount <= 0) {
                    return null;
                }

                $lineAmount = min(round((float) $obligation['amount'], 4), $remainingAmount);
                $remainingAmount = round($remainingAmount - $lineAmount, 4);

                return [
                    'financial_account_id' => (int) $obligation['account_id'],
                    'amount' => (string) number_format($lineAmount, 4, '.', ''),
                    'description' => $obligation['due_type'] . ' - ' . $obligation['month'],
                ];
            })
            ->filter()
            ->values()
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

        $redirectParameters = ['customer_id' => $customer->id];
        if ($selectedAccount) {
            $redirectParameters['account_id'] = $selectedAccount->id;
        }

        return redirect()
            ->route('teller-transactions.customer-deposit', $redirectParameters)
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
        $signatureVerified = false;

        $customerId = $request->query('customer_id');
        if ($customerId) {
            $selectedCustomer = Customer::query()
                ->where('organization_id', $organization->id)
                ->with('photo')
                ->find($customerId);

            if ($selectedCustomer) {
                $signatureVerified = $selectedCustomer->signature()
                    ->where('verification_status', 'VERIFIED')
                    ->exists();

                $savingsAccounts = FinancialAccount::query()
                    ->where('organization_id', $organization->id)
                    ->where('holder_type', Customer::class)
                    ->where('holder_id', $selectedCustomer->id)
                    ->where('account_type', 'SAVINGS')
                    ->with([
                        'product',
                        'holder.signature',
                        'holders.signature',
                        'authorizedPersons' => function ($query) use ($organization) {
                            $query
                                ->whereHas('customer', fn($customerQuery) => $customerQuery->where('organization_id', $organization->id))
                                ->with('customer.signature');
                        },
                        'chequeBooks.cheques' => fn($query) => $query->whereIn('status', ['UNUSED', 'ISSUED'])->orderBy('cheque_no'),
                    ])
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
            'signature_verified' => $signatureVerified,
            'savings_accounts' => $savingsAccounts->map(function (FinancialAccount $account): array {
                $accountHolders = $account->holders->map(fn(Customer $holder) => [
                    'id' => $holder->id,
                    'name' => $holder->name,
                    'customer_no' => $holder->customer_no,
                    'primary_phone' => $holder->primary_phone,
                    'role' => $holder->pivot->role,
                    'ownership_percent' => $holder->pivot->ownership_percent,
                    'signature' => $holder->signature ? [
                        'url' => $holder->signature->url,
                        'verification_status' => $holder->signature->verification_status,
                    ] : null,
                ]);

                if ($account->holder instanceof Customer && !$accountHolders->contains('id', $account->holder->id)) {
                    $holder = $account->holder;
                    $accountHolders->prepend([
                        'id' => $holder->id,
                        'name' => $holder->name,
                        'customer_no' => $holder->customer_no,
                        'primary_phone' => $holder->primary_phone,
                        'role' => 'PRIMARY',
                        'ownership_percent' => 100,
                        'signature' => $holder->signature ? [
                            'url' => $holder->signature->url,
                            'verification_status' => $holder->signature->verification_status,
                        ] : null,
                    ]);
                }

                return [
                    'id' => $account->id,
                    'account_type' => $account->account_type,
                    'account_no' => $account->account_no,
                    'name' => $account->name,
                    'balance' => (float) $account->balance,
                    'available_balance' => (float) $account->available_balance,
                    'account_holder' => $account->holder instanceof Customer ? [
                        'id' => $account->holder->id,
                        'name' => $account->holder->name,
                        'customer_no' => $account->holder->customer_no,
                        'primary_phone' => $account->holder->primary_phone,
                        'signature' => $account->holder->signature ? [
                            'url' => $account->holder->signature->url,
                            'verification_status' => $account->holder->signature->verification_status,
                        ] : null,
                    ] : null,
                    'account_holders' => $accountHolders->values()->all(),
                    'authorized_persons' => $account->authorizedPersons->map(fn($authorizedPerson) => [
                        'id' => $authorizedPerson->id,
                        'customer_id' => $authorizedPerson->customer_id,
                        'customer_name' => $authorizedPerson->customer?->name,
                        'customer_no' => $authorizedPerson->customer?->customer_no,
                        'primary_phone' => $authorizedPerson->customer?->primary_phone,
                        'authorization_type' => $authorizedPerson->authorization_type,
                        'designation' => $authorizedPerson->designation,
                        'transaction_limit' => $authorizedPerson->transaction_limit,
                        'is_active' => $authorizedPerson->is_active,
                        'effective_from' => $authorizedPerson->effective_from?->toDateString(),
                        'effective_to' => $authorizedPerson->effective_to?->toDateString(),
                        'signature' => $authorizedPerson->customer?->signature ? [
                            'url' => $authorizedPerson->customer->signature->url,
                            'verification_status' => $authorizedPerson->customer->signature->verification_status,
                        ] : null,
                    ])->values()->all(),
                ];
            })->all(),
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
        $account = FinancialAccount::query()
            ->where('organization_id', $organization->id)
            ->whereKey($data['financial_account_id'])
            ->where(function ($query) use ($customer): void {
                $query->where(fn($holder) => $holder
                    ->where('holder_type', Customer::class)
                    ->where('holder_id', $customer->id))
                    ->orWhereHas('holders', fn($holders) => $holders->whereKey($customer->id));
            })
            ->firstOrFail();
        $cheque = Cheque::query()
            ->whereKey($data['cheque_id'])
            ->where(function ($query) use ($account): void {
                $query->where('financial_account_id', $account->id)
                    ->orWhereHas('chequeBook', fn($book) => $book->where('financial_account_id', $account->id));
            })
            ->firstOrFail();

        $payment = app(\App\TreasuryAndCash\Application\ChequePaymentService::class)->receive(
            $cheque,
            (int) $data['teller_session_id'],
            (int) $organization->id,
            (int) $user->branch_id,
            (int) $user->id,
            $data['note'] ?? null,
        );

        return redirect()->route('cheque-payments.show', $payment)->with('success', 'Cheque received and submitted for verification.');
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

    private function customerDepositAccountPayload(FinancialAccount $account): array
    {
        $account->loadMissing(['holder', 'holders']);
        if ($account->holder_type === Customer::class) {
            $account->loadMissing('customer.photo');
        }

        return [
            'id' => $account->id,
            'account_no' => $account->account_no,
            'name' => $account->name,
            'account_type' => $account->account_type,
            'balance' => (float) $account->balance,
            'available_balance' => (float) $account->available_balance,
            'holder' => $account->holder_type === Customer::class ? $account->customer : null,
            'holders' => $account->holders->map(fn(Customer $holder) => [
                'id' => $holder->id,
                'name' => $holder->name,
                'customer_no' => $holder->customer_no,
                'type' => $holder->type,
            ])->all(),
        ];
    }

    private function buildCustomerDepositObligations($customerAccounts): array
    {
        $rows = [];
        $now = now();
        $currentMonthStart = $now->copy()->startOfMonth();

        foreach ($customerAccounts as $account) {
            if ($account->account_type === 'LOAN' && $account->loanAccount) {
                foreach ($account->loanAccount->schedules as $schedule) {
                    foreach ($schedule->components as $component) {
                        $outstanding = max(0, (float) $component->amount_due - (float) $component->amount_paid);
                        if ($outstanding <= 0 || $component->status === 'PAID' || $component->status === 'WAIVED') {
                            continue;
                        }

                        $dueDate = $schedule->due_date;
                        if ($dueDate->greaterThan($now->copy()->endOfMonth())) {
                            continue;
                        }

                        $typeLabels = [
                            'PRINCIPAL' => 'Loan repayment',
                            'INTEREST' => 'Loan interest',
                            'FEE' => 'Loan fine',
                            'PROTECTION_FEE' => 'Loan protection fee',
                        ];
                        $rows[] = [
                            'id' => 'loan-' . $component->id,
                            'account_id' => $account->id,
                            'account_type' => 'LOAN',
                            'account_name' => $account->name,
                            'account_no' => $account->account_no,
                            'due_type' => $typeLabels[$component->type] ?? 'Loan obligation',
                            'month' => $dueDate->greaterThanOrEqualTo($currentMonthStart) ? 'Current month' : 'Previous month',
                            'amount' => round($outstanding, 4),
                        ];
                    }
                }

                $protectionPolicy = $account->loanAccount->protectionPolicy;
                if (
                    $protectionPolicy
                    && $protectionPolicy->status === 'ACTIVE'
                    && $protectionPolicy->next_renewal_at
                    && $protectionPolicy->next_renewal_at->lessThanOrEqualTo($now->copy()->endOfMonth())
                    && (float) $protectionPolicy->renewal_fee > 0
                ) {
                    $rows[] = [
                        'id' => 'loan-protection-renewal-' . $account->id,
                        'account_id' => $account->id,
                        'account_type' => 'LOAN',
                        'account_name' => $account->name,
                        'account_no' => $account->account_no,
                        'due_type' => 'Loan protection renew fee',
                        'month' => $protectionPolicy->next_renewal_at->greaterThanOrEqualTo($currentMonthStart) ? 'Current month' : 'Previous month',
                        'amount' => round((float) $protectionPolicy->renewal_fee, 4),
                    ];
                }
            }

            if (in_array($account->account_type, ['SAVINGS', 'SHARE'], true)) {
                $depositDue = max(0, (float) $account->balance * 0.01);
                if ($depositDue > 0) {
                    $rows[] = [
                        'id' => 'deposit-' . $account->id,
                        'account_id' => $account->id,
                        'account_type' => $account->account_type,
                        'account_name' => $account->name,
                        'account_no' => $account->account_no,
                        'due_type' => 'Customer deposit',
                        'month' => 'Current month',
                        'amount' => round($depositDue, 4),
                    ];
                }
            }

            if ($account->account_type === 'RECURRING_DEPOSIT' && $account->recurringDeposit) {
                foreach ($account->recurringDeposit->installments as $installment) {
                    if (
                        $installment->status === 'PAID'
                        || $installment->status === 'WAIVED'
                        || $installment->due_date->greaterThan($now->copy()->endOfMonth())
                    ) {
                        continue;
                    }

                    $contribution = max(0, (float) $installment->amount_due - (float) $installment->amount_paid);
                    if ($contribution > 0) {
                        $rows[] = [
                            'id' => 'deposit-contribution-' . $installment->id,
                            'account_id' => $account->id,
                            'account_type' => $account->account_type,
                            'account_name' => $account->name,
                            'account_no' => $account->account_no,
                            'due_type' => 'Deposit contribution',
                            'month' => $installment->due_date->greaterThanOrEqualTo($currentMonthStart) ? 'Current month' : 'Previous month',
                            'amount' => round($contribution, 4),
                        ];
                    }

                    $fine = (float) $installment->fine_amount;
                    if ($fine > 0) {
                        $rows[] = [
                            'id' => 'deposit-fine-' . $installment->id,
                            'account_id' => $account->id,
                            'account_type' => $account->account_type,
                            'account_name' => $account->name,
                            'account_no' => $account->account_no,
                            'due_type' => 'Deposit fine',
                            'month' => $installment->due_date->greaterThanOrEqualTo($currentMonthStart) ? 'Current month' : 'Previous month',
                            'amount' => round($fine, 4),
                        ];
                    }
                }
            }

            foreach ($account->fines as $fine) {
                if (
                    in_array($fine->status, ['PAID', 'WAIVED', 'REVERSED'], true)
                    || $fine->assessed_at->greaterThan($now->copy()->endOfMonth())
                ) {
                    continue;
                }

                $outstanding = max(0, (float) $fine->assessed_amount - (float) $fine->waived_amount - (float) $fine->paid_amount);
                if ($outstanding <= 0) {
                    continue;
                }

                $rows[] = [
                    'id' => 'account-fine-' . $fine->id,
                    'account_id' => $account->id,
                    'account_type' => $account->account_type,
                    'account_name' => $account->name,
                    'account_no' => $account->account_no,
                    'due_type' => 'Deposit fine',
                    'month' => $fine->assessed_at->greaterThanOrEqualTo($currentMonthStart) ? 'Current month' : 'Previous month',
                    'amount' => round($outstanding, 4),
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
