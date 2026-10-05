<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;

class TellerCashTransactionService
{
    public function __construct(
        private readonly FinancialTransactionService $financialTransactionService,
    ) {
    }

    public function create(int $organizationId, int $branchId, int $userId, string $type, array $data): TellerCashTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $type, $data) {
            $session = TellerSession::query()
                ->whereKey($data['teller_session_id'])
                ->where('status', 'OPEN')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', 'OPEN');
                })
                ->with(['branchDay', 'teller.cashLocation.financialAccount'])
                ->lockForUpdate()
                ->first();

            if (!$session || !$session->teller?->cashLocation) {
                throw new \RuntimeException('An open teller session in the active branch is required.');
            }

            $nextNumber = TellerCashTransaction::query()->lockForUpdate()->count() + 1;
            $financialTransactionId = null;

            if (!empty($data['lines'])) {
                $cashAccount = $session->teller->cashLocation->financialAccount;
                if (!$cashAccount) {
                    throw new \RuntimeException('The teller cash location must be linked to a financial account before posting multi-line teller transactions.');
                }

                $accountIds = collect($data['lines'])->pluck('financial_account_id')->all();
                $accounts = FinancialAccount::query()
                    ->where('organization_id', $organizationId)
                    ->whereIn('id', $accountIds)
                    ->with('product')
                    ->get()
                    ->keyBy('id');

                $entryLines = collect($data['lines'])->map(function (array $line) use ($accounts, $type): array {
                    $account = $accounts->get($line['financial_account_id']);
                    if (!$account) {
                        throw new \RuntimeException('Every teller transaction line must reference a valid account in the active organization.');
                    }

                    $direction = $type === 'DEPOSIT' ? 'CREDIT' : 'DEBIT';

                    return [
                        'financial_account_id' => (int) $line['financial_account_id'],
                        'direction' => $direction,
                        'amount' => $line['amount'],
                        'description' => $line['description'] ?? null,
                    ];
                })->all();

                $cashDirection = $type === 'DEPOSIT' ? 'DEBIT' : 'CREDIT';
                $financialTransaction = $this->financialTransactionService->createMultiLine(
                    [
                        'transaction_type' => $type,
                        'transaction_date' => now(),
                        'reference' => $data['reference'] ?? null,
                        'description' => $data['note'] ?? null,
                    ],
                    [
                        [
                            'financial_account_id' => $cashAccount->id,
                            'direction' => $cashDirection,
                            'amount' => $data['amount'],
                            'description' => $type === 'DEPOSIT' ? 'Teller cash received' : 'Teller cash disbursed',
                        ],
                        ...$entryLines,
                    ],
                    $organizationId,
                    $userId,
                    $branchId,
                );
                $financialTransactionId = $financialTransaction->id;
            }

            return TellerCashTransaction::create([
                'branch_day_id' => $session->branch_day_id,
                'cash_location_id' => $session->teller->cashLocation->id,
                'teller_session_id' => $session->id,
                'financial_transaction_id' => $financialTransactionId,
                'transaction_no' => 'TELLER-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT),
                'type' => $type,
                'amount' => $data['amount'],
                'status' => 'PENDING',
                'reference' => $data['reference'] ?? null,
                'note' => $data['note'] ?? null,
                'requested_by' => $userId,
                'requested_at' => now(),
            ]);
        });
    }

    public function post(int $organizationId, int $branchId, int $userId, int $transactionId): TellerCashTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $transactionId) {
            $transaction = TellerCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', 'OPEN');
                })
                ->with('tellerSession')
                ->lockForUpdate()
                ->first();

            if (!$transaction || !$transaction->tellerSession || $transaction->tellerSession->status !== 'OPEN') {
                throw new \RuntimeException('A pending transaction for an open teller session is required.');
            }

            $session = TellerSession::query()
                ->whereKey($transaction->teller_session_id)
                ->lockForUpdate()
                ->firstOrFail();
            $expectedCash = (float) ($session->expected_cash ?? $session->opening_cash);
            $amount = (float) $transaction->amount;

            if ($transaction->type === 'WITHDRAWAL' && $amount > $expectedCash) {
                throw new \RuntimeException('The withdrawal amount exceeds the teller expected cash.');
            }

            if ($transaction->financial_transaction_id) {
                $this->financialTransactionService->post(
                    $transaction->financialTransaction,
                    $organizationId,
                    $userId,
                );
            }

            $session->update([
                'expected_cash' => $transaction->type === 'DEPOSIT'
                    ? $expectedCash + $amount
                    : $expectedCash - $amount,
            ]);
            $transaction->update([
                'status' => 'POSTED',
                'posted_by' => $userId,
                'posted_at' => now(),
            ]);

            return $transaction->fresh();
        });
    }

    public function updatePendingDetails(
        int $organizationId,
        int $branchId,
        int $transactionId,
        ?string $reference,
        ?string $note,
    ): TellerCashTransaction {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId, $reference, $note) {
            $transaction = TellerCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', 'OPEN');
                })
                ->with('tellerSession')
                ->lockForUpdate()
                ->first();

            if (!$transaction || !$transaction->tellerSession || $transaction->tellerSession->status !== 'OPEN') {
                throw new \RuntimeException('A pending transaction for an open teller session is required.');
            }

            $transaction->update([
                'reference' => $reference,
                'note' => $note,
            ]);

            if ($transaction->financial_transaction_id) {
                $financialTransaction = $transaction->financialTransaction()
                    ->lockForUpdate()
                    ->first();

                if (!$financialTransaction || $financialTransaction->status !== 'PENDING') {
                    throw new \RuntimeException('Only a pending financial transaction can be edited.');
                }

                $financialTransaction->update([
                    'reference' => $reference,
                    'description' => $note,
                ]);
            }

            return $transaction->fresh();
        });
    }

    public function cancelPending(
        int $organizationId,
        int $branchId,
        int $userId,
        int $transactionId,
        string $reason,
    ): TellerCashTransaction {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $transactionId, $reason) {
            $transaction = TellerCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId);
                })
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                throw new \RuntimeException('Only a pending transaction in the active branch can be cancelled.');
            }

            if ($transaction->financial_transaction_id) {
                $financialTransaction = $transaction->financialTransaction()
                    ->lockForUpdate()
                    ->first();

                if (!$financialTransaction || $financialTransaction->status !== 'PENDING') {
                    throw new \RuntimeException('The linked financial transaction is no longer pending.');
                }

                $financialTransaction->update(['status' => 'CANCELLED']);
            }

            $transaction->update([
                'status' => 'CANCELLED',
                'cancelled_by' => $userId,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
            ]);

            return $transaction->fresh();
        });
    }

    public function reversePosted(
        int $organizationId,
        int $branchId,
        int $userId,
        int $transactionId,
        string $reason,
    ): TellerCashTransaction {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $transactionId, $reason) {
            $transaction = TellerCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'POSTED')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId);
                })
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                throw new \RuntimeException('Only a posted transaction in the active branch can be reversed.');
            }

            $session = TellerSession::query()
                ->whereKey($transaction->teller_session_id)
                ->lockForUpdate()
                ->first();

            if (!$session) {
                throw new \RuntimeException('The teller session for this transaction no longer exists.');
            }

            if ($transaction->financial_transaction_id) {
                $financialTransaction = $transaction->financialTransaction()
                    ->lockForUpdate()
                    ->first();

                if (!$financialTransaction || $financialTransaction->status !== 'POSTED') {
                    throw new \RuntimeException('The linked financial transaction is not posted and cannot be reversed.');
                }

                $this->financialTransactionService->reverse($financialTransaction, $organizationId);
            }

            $expectedCash = (float) ($session->expected_cash ?? $session->opening_cash);
            $amount = (float) $transaction->amount;
            $newExpectedCash = $transaction->type === 'DEPOSIT'
                ? $expectedCash - $amount
                : $expectedCash + $amount;

            if ($newExpectedCash < 0) {
                throw new \RuntimeException('The reversal would make teller expected cash negative.');
            }

            $sessionUpdates = ['expected_cash' => $newExpectedCash];
            if ($session->status === 'CLOSED' && $session->closing_cash !== null) {
                $sessionUpdates['cash_difference'] = (float) $session->closing_cash - $newExpectedCash;
            }
            $session->update($sessionUpdates);

            $transaction->update([
                'status' => 'REVERSED',
                'reversed_by' => $userId,
                'reversed_at' => now(),
                'reversal_reason' => $reason,
            ]);

            return $transaction->fresh();
        });
    }
}
