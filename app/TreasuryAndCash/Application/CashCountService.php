<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashCount;
use App\TreasuryAndCash\Models\CashDenomination;
use App\TreasuryAndCash\Models\CashLocation;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CashCountService
{
    public function createDenomination(array $data, int $organizationId): CashDenomination
    {
        return CashDenomination::create([...$data, 'organization_id' => $organizationId]);
    }

    public function createCount(array $data, int $organizationId, int $userId): CashCount
    {
        $branchDay = BranchDay::query()->where('organization_id', $organizationId)->whereKey($data['branch_day_id'])->firstOrFail();
        if ($branchDay->status !== BranchDay::STATUS_OPEN) {
            throw new RuntimeException('Cash counts require an open branch day.');
        }
        $location = CashLocation::query()->where('organization_id', $organizationId)->where('branch_id', $branchDay->branch_id)->whereKey($data['cash_location_id'])->firstOrFail();
        $denominationIds = collect($data['denominations'])->pluck('cash_denomination_id');
        $denominations = CashDenomination::query()->where('organization_id', $organizationId)->whereIn('id', $denominationIds)->get()->keyBy('id');
        if ($denominations->count() !== $denominationIds->unique()->count()) {
            throw new RuntimeException('All denominations must belong to the active organization.');
        }

        return DB::transaction(function () use ($data, $branchDay, $location, $denominations, $userId): CashCount {
            $lines = collect($data['denominations'])->map(function (array $line) use ($denominations): array {
                $quantity = (int) $line['quantity'];
                if ($quantity < 0) {
                    throw new RuntimeException('Denomination quantities cannot be negative.');
                }
                $amount = round((float) $denominations[$line['cash_denomination_id']]->value * $quantity, 4);
                return ['cash_denomination_id' => $line['cash_denomination_id'], 'quantity' => $quantity, 'amount' => $amount];
            });
            $count = CashCount::create([
                'branch_day_id' => $branchDay->id,
                'cash_location_id' => $location->id,
                'teller_session_id' => $data['teller_session_id'] ?? null,
                'type' => $data['type'],
                'total_amount' => round($lines->sum('amount'), 4),
                'counted_by' => $userId,
                'counted_at' => now(),
                'note' => $data['note'] ?? null,
            ]);
            $count->denominations()->createMany($lines->all());
            return $count->load('denominations.denomination');
        });
    }
}