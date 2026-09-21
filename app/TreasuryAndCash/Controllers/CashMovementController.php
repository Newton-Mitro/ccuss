<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashAdjustmentService;
use App\TreasuryAndCash\Application\CashMovementDataService;
use App\TreasuryAndCash\Application\CashTransferService;
use App\TreasuryAndCash\Application\TellerCashTransactionService;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Requests\StoreCashAdjustmentRequest;
use App\TreasuryAndCash\Requests\StoreCashTransferRequest;
use App\TreasuryAndCash\Requests\StoreTellerCashTransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
