<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\PettyCashTransaction;
use Illuminate\Support\Facades\DB;

class PettyCashTransactionService
{
    public function create(int $organizationId, int $branchId, int $userId, string $type, array $data): PettyCashTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $userId, $type, $data) {
            $branchDay = BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->lockForUpdate()
                ->first();

            $fund = PettyCashFund::query()
                ->whereKey($data['petty_cash_fund_id'])
                ->where('status', 'ACTIVE')
                ->whereHas('cashLocation', function ($location) use ($organizationId, $branchId) {
                    $location
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('is_active', true);
                })
                ->lockForUpdate()
                ->first();

            if (!$branchDay || !$fund) {
                throw new \RuntimeException('An open branch day and active petty cash fund in the active branch are required.');
            }

            if ($type === 'EXPENSE' && (float) $data['amount'] > (float) $fund->current_balance) {
                throw new \RuntimeException('The expense amount cannot exceed the petty cash balance.');
            }

            $nextNumber = PettyCashTransaction::query()->lockForUpdate()->count() + 1;

            return PettyCashTransaction::create([
                'branch_day_id' => $branchDay->id,
                'petty_cash_fund_id' => $fund->id,
                'transaction_no' => 'PETTY-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT),
                'type' => $type,
                'amount' => $data['amount'],
                'payee' => $data['payee'] ?? null,
                'description' => $data['description'] ?? null,
                'expense_account_id' => $data['expense_account_id'] ?? null,
                'status' => 'PENDING',
                'created_by' => $userId,
            ]);
        });
    }
}
