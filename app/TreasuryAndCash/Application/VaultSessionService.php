<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Vault;
use App\TreasuryAndCash\Models\VaultSession;
use Illuminate\Support\Facades\DB;

class VaultSessionService
{
    public function open(
        int $organizationId,
        int $branchId,
        int $userId,
        int $branchDayId,
        int $vaultId,
        float|int|string $openingCash,
        ?string $openingNote = null,
    ): VaultSession {
        $branchDay = BranchDay::query()
            ->whereKey($branchDayId)
            ->where('organization_id', $organizationId)
            ->where('branch_id', $branchId)
            ->where('status', BranchDay::STATUS_OPEN)
            ->first();

        if (!$branchDay) {
            throw new \RuntimeException('The selected branch day is not open for this branch.');
        }

        $vault = Vault::query()
            ->whereKey($vaultId)
            ->whereHas('cashLocation', function ($query) use ($organizationId, $branchId) {
                $query->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->first();

        if (!$vault) {
            throw new \RuntimeException('The selected vault does not belong to the active branch.');
        }

        if (VaultSession::query()->where('branch_day_id', $branchDay->id)->where('vault_id', $vaultId)->exists()) {
            throw new \RuntimeException('A vault session for this vault and branch day already exists.');
        }

        return DB::transaction(function () use ($branchDay, $vault, $userId, $openingCash, $openingNote) {
            return VaultSession::create([
                'branch_day_id' => $branchDay->id,
                'vault_id' => $vault->id,
                'opened_by' => $userId,
                'status' => 'OPEN',
                'opening_cash' => $openingCash,
                'expected_cash' => $openingCash,
                'opened_at' => now(),
                'opening_note' => $openingNote,
            ]);
        });
    }

    public function close(VaultSession $vaultSession, int $userId, float|int|string $closingCash, ?string $closingNote = null): VaultSession
    {
        if ($vaultSession->status !== 'OPEN') {
            throw new \RuntimeException('Only an open vault session can be closed.');
        }

        $expectedCash = $vaultSession->expected_cash ?? $vaultSession->opening_cash;
        $cashDifference = (float) $closingCash - (float) $expectedCash;

        $vaultSession->update([
            'status' => 'CLOSED',
            'closing_cash' => $closingCash,
            'expected_cash' => $expectedCash,
            'cash_difference' => $cashDifference,
            'closed_by' => $userId,
            'closed_at' => now(),
            'closing_note' => $closingNote,
        ]);

        return $vaultSession->fresh();
    }
}
