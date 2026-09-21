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

    public function post(int $organizationId, int $branchId, int $transactionId): PettyCashTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId) {
            $transaction = PettyCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', BranchDay::STATUS_OPEN);
                })
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                throw new \RuntimeException('A pending petty cash transaction for the active branch is required.');
            }

            $fund = PettyCashFund::query()
                ->whereKey($transaction->petty_cash_fund_id)
                ->where('status', 'ACTIVE')
                ->lockForUpdate()
                ->first();

            if (!$fund) {
                throw new \RuntimeException('An active petty cash fund is required to post this transaction.');
            }

            $balance = (float) $fund->current_balance;
            $amount = (float) $transaction->amount;

            if (in_array($transaction->type, ['EXPENSE', 'RETURN'], true) && $amount > $balance) {
                throw new \RuntimeException('The transaction amount cannot exceed the petty cash balance.');
            }

            if (
                in_array($transaction->type, ['FUNDING', 'REPLENISHMENT'], true)
                && $balance + $amount > (float) $fund->fund_limit
            ) {
                throw new \RuntimeException('The transaction would exceed the petty cash fund limit.');
            }

            $fund->update([
                'current_balance' => in_array($transaction->type, ['FUNDING', 'REPLENISHMENT'], true)
                    ? $balance + $amount
                    : $balance - $amount,
            ]);
            $transaction->update(['status' => 'POSTED']);

            return $transaction->fresh();
        });
    }
}
