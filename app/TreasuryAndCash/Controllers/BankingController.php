<?php

namespace App\TreasuryAndCash\Controllers;

use App\FinancialServices\Models\FinancialAccount;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Application\BankingDataService;
use App\TreasuryAndCash\Application\BankTransactionService;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Requests\StoreBankAccountRequest;
use App\TreasuryAndCash\Requests\StoreBankTransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BankingController extends Controller
{
    public function __construct(
        private readonly BankingDataService $bankingDataService,
        private readonly BankTransactionService $bankTransactionService,
    ) {
        $this->middleware('permission:bank_accounts.view')->only(['accounts']);
        $this->middleware('permission:bank_accounts.create')->only(['createAccount', 'storeAccount']);
        $this->middleware('permission:bank_transactions.view')->only(['transactions']);
        $this->middleware('permission:bank_transactions.create')->only(['createTransaction', 'storeTransaction', 'postTransaction']);
    }

    public function accounts(Request $request): Response
    {
        $accounts = $this->bankingDataService->listAccounts(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/banking/accounts/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function createAccount(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/banking/accounts/create', [
            'branches' => Branch::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'code', 'name']),
            'ledger_accounts' => $this->counterpartLedgerAccounts($organizationId),
        ]);
    }

    public function storeAccount(StoreBankAccountRequest $request): RedirectResponse
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $data = $request->validated();
        $user = $request->user();
        $openingAmount = (float) $data['opening_balance'];

        abort_unless(
            ! $data['branch_id'] || Branch::query()->whereKey($data['branch_id'])->where('organization_id', $organizationId)->exists(),
            404,
        );

        if ($openingAmount > 0 && $data['status'] !== 'ACTIVE') {
            return back()->withInput()->with('error', 'An opening deposit requires an active bank account.');
        }

        $transactionBranchId = (int) ($data['branch_id'] ?? $user?->branch_id ?? 0);
        if ($openingAmount > 0 && $transactionBranchId <= 0) {
            return back()->withInput()->with('error', 'A branch is required to create an opening deposit transaction.');
        }

        try {
            DB::transaction(function () use ($organizationId, $data, $openingAmount, $transactionBranchId): void {
                $financialAccount = FinancialAccount::create([
                    'organization_id' => $organizationId,
                    'branch_id' => $data['branch_id'] ?? null,
                    'product_type' => null,
                    'product_id' => null,
                    'holder_type' => null,
                    'holder_id' => null,
                    'account_no' => 'BANK-'.Str::uuid(),
                    'name' => $data['account_name'],
                    'account_type' => 'BANK',
                    'status' => 'ACTIVE',
                    'balance' => 0,
                    'available_balance' => 0,
                    'interest_accrued' => 0,
                    'opened_at' => now()->toDateString(),
                    'metadata' => ['managed_by' => 'bank_account'],
                ]);

                $bankAccountData = $data;
                unset($bankAccountData['opening_counterpart_account_id']);

                $account = BankAccount::create([
                    ...$bankAccountData,
                    'organization_id' => $organizationId,
                    'financial_account_id' => $financialAccount->id,
                    'opening_balance' => 0,
                    'is_reconcilable' => (bool) ($data['is_reconcilable'] ?? false),
                ]);

                if ($openingAmount > 0) {
                    $this->bankTransactionService->create($organizationId, $transactionBranchId, [
                        'bank_account_id' => $account->id,
                        'type' => 'DEPOSIT',
                        'amount' => $openingAmount,
                        'counterpart_account_id' => $data['opening_counterpart_account_id'],
                        'reference' => 'OPENING-'.$account->account_number,
                        'description' => 'Opening balance deposit for '.$account->account_name,
                    ]);
                }
            });
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('bank-accounts.index')->with(
            'success',
            $openingAmount > 0
            ? 'Bank account created. Opening deposit is pending posting.'
            : 'Bank account created successfully.',
        );
    }

    public function transactions(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/banking/transactions/index', [
            'transactions' => $this->bankingDataService->listTransactions(
                $organizationId,
                $request->input('search'),
                $request->input('per_page', 18),
            ),
            'ledger_accounts' => $this->counterpartLedgerAccounts($organizationId),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function createTransaction(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/banking/transactions/create', [
            'bank_accounts' => BankAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', 'ACTIVE')
                ->orderBy('account_name')
                ->get(['id', 'account_name', 'account_number']),
            'ledger_accounts' => $this->counterpartLedgerAccounts($organizationId),
        ]);
    }

    public function storeTransaction(StoreBankTransactionRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user?->branch_id, 422, 'A branch assignment is required for bank transactions.');

        try {
            $this->bankTransactionService->create(
                $request->attributes->get('active_organization')->id,
                $user->branch_id,
                $request->validated(),
            );
        } catch (\RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('bank-transactions.index')->with('success', 'Bank transaction created successfully.');
    }

    public function postTransaction(Request $request, \App\TreasuryAndCash\Models\BankTransaction $transaction): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user?->branch_id, 422, 'A branch assignment is required for bank transactions.');
        $organizationId = $request->attributes->get('active_organization')->id;
        $data = $request->validate([
            'counterpart_account_id' => [
                Rule::requiredIf(! $transaction->counterpart_account_id),
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('status', true)
                    ->where('code', '!=', '1200')),
            ],
        ]);

        try {
            $this->bankTransactionService->post(
                $organizationId,
                $user->branch_id,
                $transaction->id,
                $user->id,
                isset($data['counterpart_account_id']) ? (int) $data['counterpart_account_id'] : null,
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('bank-transactions.index')->with('success', 'Bank transaction posted successfully.');
    }

    private function counterpartLedgerAccounts(int $organizationId): array
    {
        return LedgerAccount::query()
            ->where('organization_id', $organizationId)
            ->where('status', true)
            ->where('code', '!=', '1200')
            ->orderBy('code')
            ->get(['id', 'code', 'name'])
            ->all();
    }
}
