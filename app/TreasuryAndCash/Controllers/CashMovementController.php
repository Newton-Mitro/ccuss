<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashAdjustmentService;
use App\TreasuryAndCash\Application\CashMovementDataService;
use App\TreasuryAndCash\Application\CashTransferService;
use App\TreasuryAndCash\Application\TellerCashTransactionService;
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
        $this->middleware('permission:cash_transactions.create');
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
