<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Models\CashCount;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\PettyCashTransaction;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\VaultSession;

class CashLocationHistoryService
{
    public function hasHistory(CashLocation $location): bool
    {
        if (
            CashCount::query()->where('cash_location_id', $location->id)->exists()
            || CashAdjustment::query()->where('cash_location_id', $location->id)->exists()
            || CashTransfer::query()
                ->where(fn($query) => $query
                    ->where('from_cash_location_id', $location->id)
                    ->orWhere('to_cash_location_id', $location->id))
                ->exists()
        ) {
            return true;
        }

        return match ($location->type) {
            'TELLER' => TellerCashTransaction::query()
                ->where('cash_location_id', $location->id)
                ->exists()
                || TellerSession::query()
                    ->whereHas('teller', fn($query) => $query->where('cash_location_id', $location->id))
                    ->exists(),
            'VAULT' => VaultSession::query()
                ->whereHas('vault', fn($query) => $query->where('cash_location_id', $location->id))
                ->exists(),
            'PETTY_CASH' => PettyCashTransaction::query()
                ->whereHas('pettyCashFund', fn($query) => $query->where('cash_location_id', $location->id))
                ->exists(),
            default => false,
        };
    }
}