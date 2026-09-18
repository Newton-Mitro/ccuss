<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\CashTransfer;
use Illuminate\Support\Facades\DB;

class CashTransferService
{
    public function create(int $organizationId, int $branchId, int $userId, array $data): CashTransfer
    {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $data) {
            $branchDay = BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->lockForUpdate()
                ->first();

            if (!$branchDay) {
                throw new \RuntimeException('An open branch day is required before creating a cash transfer.');
            }

            $locationIds = [$data['from_cash_location_id'], $data['to_cash_location_id']];
            $locations = CashLocation::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->whereIn('id', $locationIds)
                ->get();

            if ($locations->count() !== 2) {
                throw new \RuntimeException('Both cash locations must belong to the active branch and be active.');
            }

            $nextNumber = CashTransfer::query()->lockForUpdate()->count() + 1;

            return CashTransfer::create([
                'branch_day_id' => $branchDay->id,
                'from_cash_location_id' => $data['from_cash_location_id'],
                'to_cash_location_id' => $data['to_cash_location_id'],
                'amount' => $data['amount'],
                'transfer_no' => 'TRF-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT),
                'status' => 'PENDING',
                'requested_by' => $userId,
                'requested_at' => now(),
                'note' => $data['note'] ?? null,
            ]);
        });
    }
}
