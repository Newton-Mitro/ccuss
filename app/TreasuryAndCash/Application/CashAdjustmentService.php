<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;

class CashAdjustmentService
{
    public function create(int $organizationId, int $branchId, int $userId, array $data): CashAdjustment
    {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $data) {
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

            return CashAdjustment::create([
                'branch_day_id' => $session->branch_day_id,
                'cash_location_id' => $session->teller->cashLocation->id,
                'teller_session_id' => $session->id,
                'amount' => $data['amount'],
                'type' => $data['type'],
                'reason' => $data['reason'],
                'status' => 'PENDING',
                'requested_by' => $userId,
                'requested_at' => now(),
            ]);
        });
    }

    public function approve(int $organizationId, int $branchId, int $userId, int $adjustmentId): CashAdjustment
    {
        $adjustment = CashAdjustment::query()
            ->whereKey($adjustmentId)
            ->where('status', 'PENDING')
            ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId)
                    ->where('status', 'OPEN');
            })
            ->first();

        if (!$adjustment) {
            throw new \RuntimeException('A pending adjustment for the active branch and open branch day is required.');
        }

        $adjustment->update([
            'status' => 'APPROVED',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);

        return $adjustment->fresh();
    }

    public function post(int $organizationId, int $branchId, int $adjustmentId): CashAdjustment
    {
        return DB::transaction(function () use ($organizationId, $branchId, $adjustmentId) {
            $adjustment = CashAdjustment::query()
                ->whereKey($adjustmentId)
                ->where('status', 'APPROVED')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', 'OPEN');
                })
                ->lockForUpdate()
                ->first();

            if (!$adjustment || !$adjustment->teller_session_id) {
                throw new \RuntimeException('An approved teller adjustment for the active branch is required.');
            }

            $session = TellerSession::query()
                ->whereKey($adjustment->teller_session_id)
                ->where('status', 'OPEN')
                ->lockForUpdate()
                ->first();

            if (!$session) {
                throw new \RuntimeException('An open teller session is required to post this adjustment.');
            }

            $expectedCash = (float) ($session->expected_cash ?? $session->opening_cash);
            $amount = (float) $adjustment->amount;

            if ($adjustment->type === 'SHORTAGE' && $amount > $expectedCash) {
                throw new \RuntimeException('The shortage amount exceeds the teller expected cash.');
            }

            $session->update([
                'expected_cash' => $adjustment->type === 'EXCESS'
                    ? $expectedCash + $amount
                    : $expectedCash - $amount,
            ]);
            $adjustment->update(['status' => 'POSTED']);

            return $adjustment->fresh();
        });
    }
}
