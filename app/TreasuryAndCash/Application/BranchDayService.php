<?php

namespace App\TreasuryAndCash\Application;

use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Models\BankTransaction;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\ChequeClearing;
use App\TreasuryAndCash\Models\ChequePayment;
use App\TreasuryAndCash\Models\PettyCashTransaction;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\VaultSession;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BranchDayService
{
    public function listForOrganization(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = BranchDay::query()
            ->where('organization_id', $organizationId)
            ->with(['branch', 'openedBy', 'closedBy'])
            ->orderByDesc('business_date');

        if (! empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($builder) use ($searchTerm) {
                $builder->where('business_date', 'like', "%{$searchTerm}%")
                    ->orWhereHas('branch', function ($branchQuery) use ($searchTerm) {
                        $branchQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('code', 'like', "%{$searchTerm}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function open(
        int $organizationId,
        int $branchId,
        int $userId,
        string $businessDate,
        ?string $openingNote = null,
    ): BranchDay {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $businessDate, $openingNote): BranchDay {
            Branch::query()
                ->whereKey($branchId)
                ->where('organization_id', $organizationId)
                ->lockForUpdate()
                ->firstOrFail();

            if (
                BranchDay::query()
                    ->where('branch_id', $branchId)
                    ->whereDate('business_date', $businessDate)
                    ->exists()
            ) {
                throw new \RuntimeException('A branch day already exists for this branch and date.');
            }

            if (
                BranchDay::query()
                    ->where('branch_id', $branchId)
                    ->whereIn('status', [BranchDay::STATUS_OPEN, BranchDay::STATUS_CLOSING])
                    ->exists()
            ) {
                throw new \RuntimeException('A branch day is already open for this branch. Close it before opening another business date.');
            }

            return BranchDay::create([
                'organization_id' => $organizationId,
                'branch_id' => $branchId,
                'business_date' => $businessDate,
                'status' => BranchDay::STATUS_OPEN,
                'opened_at' => now(),
                'opened_by' => $userId,
                'opening_note' => $openingNote,
            ]);
        });
    }

    public function close(BranchDay $branchDay, int $userId, ?string $closingNote = null): BranchDay
    {
        return DB::transaction(function () use ($branchDay, $userId, $closingNote): BranchDay {
            $branchDay = BranchDay::query()
                ->whereKey($branchDay->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($branchDay->status !== BranchDay::STATUS_OPEN) {
                throw new \RuntimeException('Only an open branch day can be closed.');
            }

            $this->ensureSettled($branchDay);

            $branchDay->update([
                'status' => BranchDay::STATUS_CLOSED,
                'closed_at' => now(),
                'closed_by' => $userId,
                'closing_note' => $closingNote,
            ]);

            return $branchDay->fresh();
        });
    }

    private function ensureSettled(BranchDay $branchDay): void
    {
        $branchDayId = $branchDay->id;
        $outstanding = collect([
            'open teller session' => TellerSession::query()
                ->where('branch_day_id', $branchDayId)
                ->whereIn('status', ['OPEN', 'CLOSING'])
                ->count(),
            'open vault session' => VaultSession::query()
                ->where('branch_day_id', $branchDayId)
                ->whereIn('status', ['OPEN', 'CLOSING'])
                ->count(),
            'pending teller transaction' => TellerCashTransaction::query()
                ->where('branch_day_id', $branchDayId)
                ->where('status', 'PENDING')
                ->count(),
            'unsettled cash transfer' => CashTransfer::query()
                ->where('branch_day_id', $branchDayId)
                ->whereIn('status', ['PENDING', 'APPROVED'])
                ->count(),
            'unsettled cash adjustment' => CashAdjustment::query()
                ->where('branch_day_id', $branchDayId)
                ->whereIn('status', ['PENDING', 'APPROVED'])
                ->count(),
            'pending petty cash transaction' => PettyCashTransaction::query()
                ->where('branch_day_id', $branchDayId)
                ->where('status', 'PENDING')
                ->count(),
            'pending bank transaction' => BankTransaction::query()
                ->where('branch_day_id', $branchDayId)
                ->where('status', 'PENDING')
                ->count(),
            'unsettled cheque clearing' => ChequeClearing::query()
                ->where('branch_day_id', $branchDayId)
                ->whereIn('status', ['RECEIVED', 'SENT', 'PRESENTED'])
                ->count(),
            'unsettled cheque payment' => ChequePayment::query()
                ->whereHas('tellerSession', fn ($query) => $query
                    ->where('branch_day_id', $branchDayId))
                ->whereIn('status', ['RECEIVED', 'PENDING_APPROVAL', 'APPROVED'])
                ->count(),
        ])->filter(fn (int $count) => $count > 0)
            ->map(fn (int $count, string $label) => "{$count} {$label}".($count === 1 ? '' : 's'));

        if ($outstanding->isNotEmpty()) {
            throw new \RuntimeException(
                'Cannot close branch day until outstanding items are settled: '
                .$outstanding->implode(', ').'.',
            );
        }
    }
}
