<?php

namespace App\TreasuryAndCash\Application;

use App\GeneralAccounting\Application\TreasurySummaryPostingService;
use App\GeneralAccounting\Models\LedgerAccount;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankTransaction;
use App\TreasuryAndCash\Models\BranchDay;
use Illuminate\Support\Facades\DB;

class BankTransactionService
{
    public function __construct(
        private readonly TreasurySummaryPostingService $summaryPostingService,
    ) {}

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
                ->where(fn ($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
                ->where('status', 'ACTIVE')
                ->lockForUpdate()
                ->first();

            if (! $branchDay || ! $account) {
                throw new \RuntimeException('An open branch day and active bank account are required.');
            }

            $number = BankTransaction::query()->lockForUpdate()->count() + 1;

            return BankTransaction::create([
                'branch_day_id' => $branchDay->id,
                'bank_account_id' => $account->id,
                'counterpart_account_id' => $data['counterpart_account_id'],
                'transaction_no' => 'BANK-'.now()->format('Ymd').'-'.str_pad((string) $number, 5, '0', STR_PAD_LEFT),
                'type' => $data['type'],
                'amount' => $data['amount'],
                'transaction_date' => $data['transaction_date'] ?? $branchDay->business_date,
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'status' => 'PENDING',
            ]);
        });
    }

    public function post(
        int $organizationId,
        int $branchId,
        int $transactionId,
        int $userId,
        ?int $counterpartAccountId = null,
    ): BankTransaction {
        return DB::transaction(function () use ($organizationId, $branchId, $transactionId, $userId, $counterpartAccountId) {
            $transaction = BankTransaction::query()
                ->whereKey($transactionId)
                ->where('status', 'PENDING')
                ->whereHas('branchDay', fn ($day) => $day
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId)
                    ->where('status', BranchDay::STATUS_OPEN))
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new \RuntimeException('A pending bank transaction for the active branch is required.');
            }

            if (! $transaction->counterpart_account_id && $counterpartAccountId) {
                $transaction->update(['counterpart_account_id' => $counterpartAccountId]);
            }

            $account = BankAccount::query()->whereKey($transaction->bank_account_id)->lockForUpdate()->firstOrFail();
            $balance = (float) $account->opening_balance + (float) BankTransaction::query()
                ->where('bank_account_id', $account->id)
                ->where('status', 'POSTED')
                ->get()
                ->sum(fn (BankTransaction $item) => in_array($item->type, ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'], true) ? (float) $item->amount : -(float) $item->amount);
            $change = in_array($transaction->type, ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'], true) ? (float) $transaction->amount : -(float) $transaction->amount;
            $newBalance = $balance + $change;

            if ($newBalance < 0) {
                throw new \RuntimeException('The transaction would make the bank balance negative.');
            }

            $counterpartAccount = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->where('code', '!=', '1200')
                ->whereKey($transaction->counterpart_account_id)
                ->first();
            $bankControlAccount = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('code', '1200')
                ->where('status', true)
                ->where('is_cash_account', true)
                ->where('is_control_account', true)
                ->first();

            if (! $counterpartAccount || ! $bankControlAccount) {
                throw new \RuntimeException('An active counterpart account and Bank Accounts control account are required to post this transaction.');
            }

            $bankIncreases = in_array($transaction->type, ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'], true);

            $this->summaryPostingService->post(
                organizationId: $organizationId,
                sourceType: 'BANK_TRANSACTION',
                sourceCode: 'DEFAULT',
                transactionType: $transaction->type,
                voucherNo: 'BANK-GL-'.$transaction->id,
                voucherDate: $transaction->transaction_date->toDateString(),
                branchId: $branchId,
                userId: $userId,
                amount: (float) $transaction->amount,
                description: $transaction->description ?? 'Bank '.strtolower($transaction->type),
                reference: $transaction->reference ?: $transaction->transaction_no,
                debitAccountOverride: $bankIncreases ? $bankControlAccount->id : $counterpartAccount->id,
                creditAccountOverride: $bankIncreases ? $counterpartAccount->id : $bankControlAccount->id,
            );

            $transaction->update(['status' => 'POSTED', 'balance_after' => $newBalance]);

            return $transaction->fresh();
        });
    }
}
