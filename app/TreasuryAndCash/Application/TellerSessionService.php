<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;

class TellerSessionService
{
    public function __construct(
        private readonly CashLocationFinancialAccountService $cashLocationFinancialAccountService,
    ) {}

    public function open(
        int $organizationId,
        int $branchId,
        int $userId,
        int $branchDayId,
        int $tellerId,
        float|int|string $openingCash,
        ?string $openingNote = null,
    ): TellerSession {
        $branchDay = BranchDay::query()
            ->whereKey($branchDayId)
            ->where('organization_id', $organizationId)
            ->where('branch_id', $branchId)
            ->where('status', BranchDay::STATUS_OPEN)
            ->first();

        if (! $branchDay) {
            throw new \RuntimeException('The selected branch day is not open for this branch.');
        }

        $teller = Teller::query()
            ->whereKey($tellerId)
            ->whereHas('cashLocation', function ($query) use ($organizationId, $branchId) {
                $query->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->first();

        if (! $teller) {
            throw new \RuntimeException('The selected teller does not belong to the active branch.');
        }

        return DB::transaction(function () use ($organizationId, $branchId, $branchDay, $teller, $userId, $openingCash, $openingNote) {
            $branchDay = BranchDay::query()
                ->whereKey($branchDay->id)
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->lockForUpdate()
                ->first();

            if (! $branchDay || $branchDay->status !== BranchDay::STATUS_OPEN) {
                throw new \RuntimeException('The selected branch day is not open for this branch.');
            }

            if (TellerSession::query()
                ->where('branch_day_id', $branchDay->id)
                ->where('teller_id', $teller->id)
                ->whereIn('status', ['OPEN', 'CLOSING'])
                ->exists()) {
                throw new \RuntimeException('An active teller session for this teller and branch day already exists.');
            }

            $this->cashLocationFinancialAccountService->ensureLinked(
                $teller->cashLocation,
                $openingCash,
            );

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
