<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;

class TellerSessionService
{
    public function open(
        int $organizationId,
        int $branchId,
        int $userId,
        int $tellerId,
        float|int|string $openingCash,
        ?string $openingNote = null,
    ): TellerSession {
        $branchDay = BranchDay::query()
            ->where('organization_id', $organizationId)
            ->where('branch_id', $branchId)
            ->where('status', BranchDay::STATUS_OPEN)
            ->latest('business_date')
            ->first();

        if (!$branchDay) {
            throw new \RuntimeException('An open branch day is required before opening a teller session.');
        }

        $teller = Teller::query()
            ->whereKey($tellerId)
            ->whereHas('cashLocation', function ($query) use ($organizationId, $branchId) {
                $query->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->first();

        if (!$teller) {
            throw new \RuntimeException('The selected teller does not belong to the active branch.');
        }

        if (TellerSession::query()->where('branch_day_id', $branchDay->id)->where('teller_id', $tellerId)->exists()) {
            throw new \RuntimeException('A teller session for this teller and branch day already exists.');
        }

        return DB::transaction(function () use ($branchDay, $teller, $userId, $openingCash, $openingNote) {
            return TellerSession::create([
                'branch_day_id' => $branchDay->id,
                'teller_id' => $teller->id,
                'opened_by' => $userId,
                'status' => 'OPEN',
                'opening_cash' => $openingCash,
                'expected_cash' => $openingCash,
                'opened_at' => now(),
                'opening_note' => $openingNote,
            ]);
        });
    }

    public function close(TellerSession $tellerSession, int $userId, float|int|string $closingCash, ?string $closingNote = null): TellerSession
    {
        if ($tellerSession->status !== 'OPEN') {
            throw new \RuntimeException('Only an open teller session can be closed.');
        }

        $expectedCash = $tellerSession->expected_cash ?? $tellerSession->opening_cash;
        $cashDifference = (float) $closingCash - (float) $expectedCash;

        $tellerSession->update([
            'status' => 'CLOSED',
            'closing_cash' => $closingCash,
            'expected_cash' => $expectedCash,
            'cash_difference' => $cashDifference,
            'closed_by' => $userId,
            'closed_at' => now(),
            'closing_note' => $closingNote,
        ]);

        return $tellerSession->fresh();
    }
}
