<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BranchDayService
{
    public function queryForOrganization(int $organizationId): Builder
    {
        return BranchDay::query()->where('organization_id', $organizationId);
    }

    public function open(array $data, int $organizationId, int $userId): BranchDay
    {
        return DB::transaction(function () use ($data, $organizationId, $userId) {
            $existing = BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $data['branch_id'])
                ->whereDate('business_date', $data['business_date'])
                ->first();

            if ($existing) {
                throw new RuntimeException('A branch day already exists for this date.');
            }

            return BranchDay::create([
                ...$data,
                'organization_id' => $organizationId,
                'status' => BranchDay::STATUS_OPEN,
                'opened_by' => $userId,
                'opened_at' => now(),
            ]);
        });
    }

    public function close(BranchDay $branchDay, int $userId): BranchDay
    {
        if ($branchDay->status !== BranchDay::STATUS_OPEN) {
            throw new RuntimeException('Only open branch days can be closed.');
        }

        $branchDay->update([
            'status' => BranchDay::STATUS_CLOSED,
            'closed_by' => $userId,
            'closed_at' => now(),
        ]);

        return $branchDay->refresh();
    }
}
