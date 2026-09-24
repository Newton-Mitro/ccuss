<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\PettyCashDataService;
use App\TreasuryAndCash\Application\PettyCashTransactionService;
use App\TreasuryAndCash\Requests\StorePettyCashTransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PettyCashController extends Controller
{
    public function __construct(
        private readonly PettyCashDataService $pettyCashDataService,
        private readonly PettyCashTransactionService $pettyCashTransactionService,
    ) {
        $this->middleware('permission:petty_cash.view')->only(['accounts']);
        $this->middleware('permission:petty_cash.create')->only(['create', 'store', 'funding', 'storeFunding']);
        $this->middleware('permission:petty_cash.expense')->only(['expense', 'storeExpense']);
        $this->middleware('permission:petty_cash.view')->only(['transactions']);
        $this->middleware('permission:petty_cash.expense')->only(['postTransaction']);
    }

    public function accounts(Request $request): Response
    {
        $funds = $this->pettyCashDataService->listFunds(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/petty-cash/accounts/index', [
            'funds' => $funds,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function transactions(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for petty cash transactions.');

        return Inertia::render('treasury-cash/petty-cash/transactions/index', [
            'transactions' => $this->pettyCashDataService->listTransactions(
                $organization->id,
                $user->branch_id,
                $request->input('search'),
                $request->input('per_page', 18),
            ),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function postTransaction(Request $request, \App\TreasuryAndCash\Models\PettyCashTransaction $transaction): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for petty cash transactions.');

        try {
            $this->pettyCashTransactionService->post($organization->id, $user->branch_id, $transaction->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('petty-cash-transactions.index')
            ->with('success', 'Petty cash transaction posted successfully.');
    }

    public function create(Request $request): Response
    {
        return Inertia::render('treasury-cash/petty-cash/accounts/create', [
            'cash_locations' => \App\TreasuryAndCash\Models\CashLocation::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->where('type', 'PETTY_CASH')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function store(\App\TreasuryAndCash\Requests\StorePettyCashFundRequest $request): RedirectResponse
    {
        \App\TreasuryAndCash\Models\PettyCashFund::create([
            'cash_location_id' => $request->validated('cash_location_id'),
            'custodian_id' => $request->user()->id,
            'code' => $request->validated('code'),
            'name' => $request->validated('name'),
            'fund_limit' => $request->validated('fund_limit'),
            'current_balance' => $request->validated('current_balance', 0),
            'method' => $request->validated('method', 'IMPREST'),
            'status' => $request->validated('status', 'ACTIVE'),
        ]);

        return redirect()->route('petty-cash-accounts.index')->with('success', 'Petty cash fund created successfully.');
    }

    public function funding(Request $request): Response
    {
        return $this->transactionForm($request, 'FUNDING');
    }

    public function expense(Request $request): Response
    {
        return $this->transactionForm($request, 'EXPENSE');
    }

    public function storeFunding(StorePettyCashTransactionRequest $request): RedirectResponse
    {
        return $this->storeTransaction($request, 'FUNDING', 'funding');
    }

    public function storeExpense(StorePettyCashTransactionRequest $request): RedirectResponse
    {
        return $this->storeTransaction($request, 'EXPENSE', 'expense');
    }

    private function transactionForm(Request $request, string $type): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for petty cash transactions.');

        return Inertia::render('treasury-cash/petty-cash/transactions/form', [
            ...$this->pettyCashDataService->forTransaction($organization->id, $user->branch_id),
            'transaction_type' => $type,
        ]);
    }

    private function storeTransaction(
        StorePettyCashTransactionRequest $request,
        string $type,
        string $routeType,
    ): RedirectResponse {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        abort_unless($user?->branch_id, 422, 'A branch assignment is required for petty cash transactions.');

        try {
            $transaction = $this->pettyCashTransactionService->create(
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
            ->route('petty-cash-transactions.' . $routeType)
            ->with('success', "Petty cash transaction {$transaction->transaction_no} created successfully.");
    }
}
