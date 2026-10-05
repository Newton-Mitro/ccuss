<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\CashBranchAccessService;
use App\TreasuryAndCash\Application\CashLocationHistoryService;
use App\TreasuryAndCash\Application\PettyCashDataService;
use App\TreasuryAndCash\Application\PettyCashTransactionService;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Requests\StorePettyCashTransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PettyCashController extends Controller
{
    public function __construct(
        private readonly CashBranchAccessService $cashBranchAccessService,
        private readonly CashLocationHistoryService $cashLocationHistoryService,
        private readonly PettyCashDataService $pettyCashDataService,
        private readonly PettyCashTransactionService $pettyCashTransactionService,
    ) {
        $this->middleware('permission:petty_cash.view')->only(['accounts']);
        $this->middleware('permission:petty_cash.create')->only(['create', 'store', 'funding', 'storeFunding']);
        $this->middleware('permission:petty_cash.update')->only(['edit', 'update']);
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
            $this->pettyCashTransactionService->post($organization->id, $user->branch_id, $transaction->id, $user->id);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('petty-cash-transactions.index')
            ->with('success', 'Petty cash transaction posted successfully.');
    }

    public function create(Request $request): Response
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();

        return Inertia::render('treasury-cash/petty-cash/accounts/create', [
            'branches' => $this->cashBranchAccessService->branchesFor(
                $organization->id,
            ),
            'default_branch_id' => $user->branch_id,
            'default_custodian_id' => $user->branch_id ? $user->id : null,
            'users' => User::query()
                ->forOrganization($organization->id)
                ->orderBy('name')
                ->get(['id', 'branch_id', 'name', 'email']),
        ]);
    }

    public function store(\App\TreasuryAndCash\Requests\StorePettyCashFundRequest $request): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $user = $request->user();
        $data = $request->validated();

        if (!$this->cashBranchAccessService->canManage($organization->id, (int) $data['branch_id'])) {
            throw ValidationException::withMessages([
                'branch_id' => 'Select a branch in the active organization.',
            ]);
        }

        if (!User::query()->forOrganization($organization->id)->whereKey($data['custodian_id'])->exists()) {
            throw ValidationException::withMessages([
                'custodian_id' => 'Select a custodian belonging to the active organization.',
            ]);
        }

        DB::transaction(function () use ($organization, $user, $data): void {
            $location = CashLocation::create([
                'organization_id' => $organization->id,
                'branch_id' => $data['branch_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'type' => 'PETTY_CASH',
                'is_active' => ($data['status'] ?? 'ACTIVE') === 'ACTIVE',
            ]);

            PettyCashFund::create([
                'cash_location_id' => $location->id,
                'custodian_id' => $data['custodian_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'fund_limit' => $data['fund_limit'],
                'current_balance' => $data['current_balance'] ?? 0,
                'method' => $data['method'] ?? 'IMPREST',
                'status' => $data['status'] ?? 'ACTIVE',
            ]);
        });

        return redirect()->route('petty-cash-accounts.index')->with('success', 'Petty cash fund created successfully.');
    }

    public function edit(Request $request, PettyCashFund $fund): Response
    {
        $organization = $request->attributes->get('active_organization');
        $cashLocation = $fund->cashLocation;
        abort_unless($cashLocation?->organization_id === $organization->id, 404);

        return Inertia::render('treasury-cash/petty-cash/accounts/create', [
            'fund' => $fund->load('cashLocation.branch'),
            'branches' => $this->cashBranchAccessService->branchesFor($organization->id),
            'default_branch_id' => $cashLocation->branch_id,
            'branch_locked' => $this->cashLocationHistoryService->hasHistory($cashLocation),
            'users' => User::query()
                ->forOrganization($organization->id)
                ->orderBy('name')
                ->get(['id', 'branch_id', 'name', 'email']),
        ]);
    }

    public function update(\App\TreasuryAndCash\Requests\StorePettyCashFundRequest $request, PettyCashFund $fund): RedirectResponse
    {
        $organization = $request->attributes->get('active_organization');
        $cashLocation = $fund->cashLocation;
        abort_unless($cashLocation?->organization_id === $organization->id, 404);

        $data = $request->validated();
        if (!User::query()->forOrganization($organization->id)->whereKey($data['custodian_id'])->exists()) {
            throw ValidationException::withMessages([
                'custodian_id' => 'Select a custodian belonging to the active organization.',
            ]);
        }

        if (
            (int) $data['branch_id'] !== (int) $cashLocation->branch_id
            && $this->cashLocationHistoryService->hasHistory($cashLocation)
        ) {
            throw ValidationException::withMessages([
                'branch_id' => 'This petty cash fund has transaction history and cannot be moved to another branch.',
            ]);
        }

        DB::transaction(function () use ($fund, $cashLocation, $data): void {
            $fund->update([
                'code' => $data['code'],
                'name' => $data['name'],
                'custodian_id' => $data['custodian_id'],
                'fund_limit' => $data['fund_limit'],
                'method' => $data['method'] ?? 'IMPREST',
                'status' => $data['status'] ?? 'ACTIVE',
            ]);
            $cashLocation->update([
                'branch_id' => $data['branch_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'is_active' => ($data['status'] ?? 'ACTIVE') === 'ACTIVE',
            ]);
        });

        return redirect()->route('petty-cash-accounts.index')->with('success', 'Petty cash fund updated successfully.');
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
