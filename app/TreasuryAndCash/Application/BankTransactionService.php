<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankTransaction;
use App\TreasuryAndCash\Models\BranchDay;
use Illuminate\Support\Facades\DB;

class BankTransactionService
{
    public function create(int $organizationId, int $branchId, array $data): BankTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $data) {
            $branchDay = BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->first();
            $account = BankAccount::query()
                ->whereKey($data['bank_account_id'])
                ->where('organization_id', $organizationId)
                ->where('status', 'ACTIVE')
                ->lockForUpdate()
                ->first();

            if (!$branchDay || !$account) {
                throw new \RuntimeException('An open branch day and active bank account are required.');
            }

            $number = BankTransaction::query()->lockForUpdate()->count() + 1;

            return BankTransaction::create([
                'branch_day_id' => $branchDay->id,
                'bank_account_id' => $account->id,
                'transaction_no' => 'BANK-' . now()->format('Ymd') . '-' . str_pad((string) $number, 5, '0', STR_PAD_LEFT),
                'type' => $data['type'],
                'amount' => $data['amount'],
                'transaction_date' => $data['transaction_date'],
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'status' => 'PENDING',
            ]);
        });
    }

    public function post(int $organizationId, int $branchId, int $transactionId): BankTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId) {
            $transaction = BankTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', fn($day) => $day
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId)
                    ->where('status', BranchDay::STATUS_OPEN))
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                throw new \RuntimeException('A pending bank transaction for the active branch is required.');
            }

            $account = BankAccount::query()->whereKey($transaction->bank_account_id)->lockForUpdate()->firstOrFail();
            $balance = (float) $account->opening_balance + (float) BankTransaction::query()
                ->where('bank_account_id', $account->id)
                ->where('status', 'POSTED')
                ->get()
                ->sum(fn(BankTransaction $item) => in_array($item->type, ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'], true) ? (float) $item->amount : -(float) $item->amount);
            $change = in_array($transaction->type, ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'], true) ? (float) $transaction->amount : -(float) $transaction->amount;
            $newBalance = $balance + $change;

            if ($newBalance < 0) {
                throw new \RuntimeException('The transaction would make the bank balance negative.');
            }

            $transaction->update(['status' => 'POSTED', 'balance_after' => $newBalance]);

            return $transaction->fresh();
        });
    }
}
