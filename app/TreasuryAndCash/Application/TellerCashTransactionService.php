<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;

class TellerCashTransactionService
{
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
                ->with(['branchDay', 'teller.cashLocation'])
                ->lockForUpdate()
                ->first();

            if (!$session || !$session->teller?->cashLocation) {
                throw new \RuntimeException('An open teller session in the active branch is required.');
            }

            $nextNumber = TellerCashTransaction::query()->lockForUpdate()->count() + 1;

            return TellerCashTransaction::create([
                'branch_day_id' => $session->branch_day_id,
                'cash_location_id' => $session->teller->cashLocation->id,
                'teller_session_id' => $session->id,
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
