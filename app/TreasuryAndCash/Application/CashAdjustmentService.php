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
}
