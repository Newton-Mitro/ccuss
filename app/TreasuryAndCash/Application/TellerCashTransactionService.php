<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Application\FinancialTransactionService;
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

            if ($type === 'DEPOSIT' && !empty($data['lines'])) {
                $cashAccount = $session->teller->cashLocation->financialAccount;
                if (!$cashAccount) {
                    throw new \RuntimeException('The teller cash location must be linked to a financial account before posting multi-line deposits.');
                }

                $financialTransaction = $this->financialTransactionService->createMultiLine(
                    [
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => now(),
                        'reference' => $data['reference'] ?? null,
                        'description' => $data['note'] ?? null,
                    ],
                    [
                        [
                            'financial_account_id' => $cashAccount->id,
                            'direction' => 'DEBIT',
                            'amount' => $data['amount'],
                            'description' => 'Teller cash received',
                        ],
                        ...collect($data['lines'])->map(fn(array $line): array => [
                            'financial_account_id' => $line['financial_account_id'],
                            'direction' => 'CREDIT',
                            'amount' => $line['amount'],
                            'description' => $line['description'] ?? null,
                        ])->all(),
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
}
