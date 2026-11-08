<?php

namespace App\TreasuryAndCash\Application;

use App\GeneralAccounting\Application\TreasurySummaryPostingService;
use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\Voucher;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\PettyCashTransaction;
use Illuminate\Support\Facades\DB;

class PettyCashTransactionService
{
    public function __construct(
        private readonly TreasurySummaryPostingService $summaryPostingService,
        private readonly CashLocationFinancialAccountService $cashLocationFinancialAccountService,
        private readonly VoucherService $voucherService,
    ) {}

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

            if (! $branchDay || ! $fund) {
                throw new \RuntimeException('An open branch day and active petty cash fund in the active branch are required.');
            }

            if ($type === 'EXPENSE' && (float) $data['amount'] > (float) $fund->current_balance) {
                throw new \RuntimeException('The expense amount cannot exceed the petty cash balance.');
            }

            $nextNumber = PettyCashTransaction::query()->lockForUpdate()->count() + 1;

            return PettyCashTransaction::create([
                'branch_day_id' => $branchDay->id,
                'petty_cash_fund_id' => $fund->id,
                'transaction_no' => 'PETTY-'.now()->format('Ymd').'-'.str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT),
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

    public function post(int $organizationId, int $branchId, int $transactionId, int $userId): PettyCashTransaction
    {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId, $userId) {
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

            if (! $transaction) {
                throw new \RuntimeException('A pending petty cash transaction for the active branch is required.');
            }

            $fund = PettyCashFund::query()
                ->whereKey($transaction->petty_cash_fund_id)
                ->where('status', 'ACTIVE')
                ->lockForUpdate()
                ->first();

            if (! $fund) {
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
            $cashAccount = $this->cashLocationFinancialAccountService->ensureLinked($fund->cashLocation);
            $cashBalance = (float) $fund->fresh()->current_balance;
            $cashAccount->update([
                'balance' => $cashBalance,
                'available_balance' => $cashBalance,
            ]);

            $branchDay = BranchDay::query()->findOrFail($transaction->branch_day_id);
            $this->summaryPostingService->post(
                organizationId: $organizationId,
                sourceType: 'PETTY_CASH_TRANSACTION',
                sourceCode: 'DEFAULT',
                transactionType: $transaction->type,
                voucherNo: 'PETTY-GL-'.$transaction->id,
                voucherDate: (string) $branchDay->business_date,
                branchId: $branchId,
                userId: $userId,
                amount: $amount,
                description: $transaction->description ?? 'Petty cash '.strtolower($transaction->type),
                reference: $transaction->transaction_no,
                debitAccountOverride: $transaction->type === 'EXPENSE' && $transaction->expense_account_id
                ? (int) $transaction->expense_account_id
                : null,
            );

            $transaction->update(['status' => 'POSTED']);

            return $transaction->fresh();
        });
    }

    public function cancelPending(
        int $organizationId,
        int $branchId,
        int $transactionId,
        int $userId,
        string $reason,
    ): PettyCashTransaction {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId, $userId, $reason) {
            $transaction = PettyCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId))
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new \RuntimeException('Only a pending petty cash transaction in the active branch can be cancelled.');
            }

            $transaction->update([
                'status' => 'CANCELLED',
                'cancelled_by' => $userId,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
            ]);

            return $transaction->fresh();
        });
    }

    public function reversePosted(
        int $organizationId,
        int $branchId,
        int $transactionId,
        int $userId,
        string $reason,
    ): PettyCashTransaction {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId, $userId, $reason) {
            $transaction = PettyCashTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'POSTED')
                ->whereHas('branchDay', fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId))
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new \RuntimeException('Only a posted petty cash transaction in the active branch can be reversed.');
            }

            $fund = PettyCashFund::query()
                ->whereKey($transaction->petty_cash_fund_id)
                ->lockForUpdate()
                ->first();

            if (! $fund) {
                throw new \RuntimeException('The petty cash fund for this transaction no longer exists.');
            }

            $increasesBalance = in_array($transaction->type, ['FUNDING', 'REPLENISHMENT'], true);
            $balance = (float) $fund->current_balance;
            $amount = (float) $transaction->amount;
            $newBalance = $increasesBalance ? $balance - $amount : $balance + $amount;

            if ($newBalance < 0) {
                throw new \RuntimeException('The reversal would make the petty cash balance negative.');
            }
            if ($newBalance > (float) $fund->fund_limit) {
                throw new \RuntimeException('The reversal would exceed the petty cash fund limit.');
            }

            $voucher = Voucher::query()
                ->where('organization_id', $organizationId)
                ->where('voucher_no', 'PETTY-GL-'.$transaction->id)
                ->with(['entries', 'fiscalPeriod'])
                ->lockForUpdate()
                ->first();

            if (! $voucher || $voucher->status !== 'POSTED') {
                throw new \RuntimeException('The posted General Ledger voucher for this transaction could not be found.');
            }

            $this->voucherService->reverse($voucher, $organizationId, $userId);

            $fund->update(['current_balance' => $newBalance]);
            $cashAccount = $this->cashLocationFinancialAccountService->ensureLinked(
                $fund->cashLocation,
                $newBalance,
            );
            $cashAccount->update([
                'balance' => $newBalance,
                'available_balance' => $newBalance,
            ]);

            $transaction->update([
                'status' => 'REVERSED',
                'reversed_by' => $userId,
                'reversed_at' => now(),
                'reversal_reason' => $reason,
            ]);

            return $transaction->fresh();
        });
    }
}
