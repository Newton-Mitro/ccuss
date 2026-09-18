<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\SystemAdministration\Models\Branch;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class BranchDayService
{
    public function listForOrganization(int $organizationId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = BranchDay::query()
            ->where('organization_id', $organizationId)
            ->with(['branch', 'openedBy', 'closedBy'])
            ->orderByDesc('business_date');

        if (!empty($search)) {
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
        $this->ensureBranchBelongsToOrganization($organizationId, $branchId);

        if (
            BranchDay::query()
                ->where('branch_id', $branchId)
                ->whereDate('business_date', $businessDate)
                ->exists()
        ) {
            throw new \RuntimeException('A branch day already exists for this branch and date.');
        }

        return DB::transaction(fn() => BranchDay::create([
            'organization_id' => $organizationId,
            'branch_id' => $branchId,
            'business_date' => $businessDate,
            'status' => BranchDay::STATUS_OPEN,
            'opened_at' => now(),
            'opened_by' => $userId,
            'opening_note' => $openingNote,
        ]));
    }

    public function close(BranchDay $branchDay, int $userId, ?string $closingNote = null): BranchDay
    {
        if ($branchDay->status !== BranchDay::STATUS_OPEN) {
            throw new \RuntimeException('Only an open branch day can be closed.');
        }

        $branchDay->update([
            'status' => BranchDay::STATUS_CLOSED,
            'closed_at' => now(),
            'closed_by' => $userId,
            'closing_note' => $closingNote,
        ]);

        return $branchDay->fresh();
    }

    private function ensureBranchBelongsToOrganization(int $organizationId, int $branchId): void
    {
        abort_unless(
            Branch::query()
                ->whereKey($branchId)
                ->where('organization_id', $organizationId)
                ->exists(),
            404,
        );
    }
}
