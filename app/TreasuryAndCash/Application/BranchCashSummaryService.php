<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchCashSummary;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;

class BranchCashSummaryService
{
    public function calculate(BranchDay $branchDay, int $organizationId): BranchCashSummary
    {
        abort_unless($branchDay->organization_id === $organizationId, 404);

        $opening = (float) TellerSession::query()->where('branch_day_id', $branchDay->id)->sum('opening_cash');
        $received = (float) TellerCashTransaction::query()->where('branch_day_id', $branchDay->id)->where('status', 'POSTED')->where('type', 'DEPOSIT')->sum('amount');
        $paid = (float) TellerCashTransaction::query()->where('branch_day_id', $branchDay->id)->where('status', 'POSTED')->where('type', 'WITHDRAWAL')->sum('amount');
        $locations = CashLocation::query()->where('organization_id', $organizationId)->where('branch_id', $branchDay->branch_id)->with('financialAccount')->get();
        $vault = (float) $locations->where('type', 'VAULT')->sum(fn($location) => (float) ($location->financialAccount?->balance ?? 0));
        $teller = (float) $locations->where('type', 'TELLER')->sum(fn($location) => (float) ($location->financialAccount?->balance ?? 0));
        $petty = (float) PettyCashFund::query()->whereHas('cashLocation', fn($query) => $query->where('organization_id', $organizationId)->where('branch_id', $branchDay->branch_id))->where('status', 'ACTIVE')->sum('current_balance');
        $closing = round($vault + $teller + $petty, 4);
        $difference = round($closing - ($opening + $received - $paid), 4);

        return DB::transaction(fn() => BranchCashSummary::updateOrCreate(
            ['branch_day_id' => $branchDay->id],
            ['opening_cash' => $opening, 'cash_received' => $received, 'cash_paid' => $paid, 'vault_balance' => $vault, 'teller_balance' => $teller, 'petty_cash_balance' => $petty, 'closing_cash' => $closing, 'cash_difference' => $difference],
        ));
    }
}