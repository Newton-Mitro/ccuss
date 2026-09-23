<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Application\FinancialProductPolicyService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanDisbursement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class FinancialTransactionService
{
    public function __construct(private readonly FinancialProductPolicyService $policyService)
    {
    }

    public function create(array $data, int $organizationId, int $userId): FinancialTransaction
    {
        $account = FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($data['financial_account_id']);

        if (!empty($data['idempotency_key'])) {
            $existing = FinancialTransaction::query()
                ->where('organization_id', $organizationId)
                ->where('idempotency_key', $data['idempotency_key'])
                ->with('entries')
                ->first();

            if ($existing) {
                $entry = $existing->entries->first();
                if (
                    !$entry
                    || $entry->financial_account_id !== $account->id
                    || $existing->transaction_type !== $data['transaction_type']
                    || (float) $existing->amount !== (float) $data['amount']
                ) {
                    throw new RuntimeException('The idempotency key is already used for a different transaction.');
                }

                return $existing;
            }
        }

        if (!in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
            throw new RuntimeException('Transactions cannot be created for this account status.');
        }

        if ($data['transaction_type'] === 'DEPOSIT') {
            $account->loadMissing('product');
            $this->policyService->validateDeposit($account, (float) $data['amount']);
        }

        return DB::transaction(function () use ($data, $account, $organizationId, $userId) {
            $transaction = FinancialTransaction::create([
                'organization_id' => $organizationId,
                'branch_id' => $account->branch_id,
                'transaction_no' => $this->nextNumber($organizationId),
                'idempotency_key' => $data['idempotency_key'] ?? null,
                'transaction_type' => $data['transaction_type'],
                'transaction_date' => $data['transaction_date'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'BDT',
                'status' => 'PENDING',
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'created_by' => $userId,
            ]);

            $transaction->entries()->create([
                'financial_account_id' => $account->id,
                'direction' => $data['transaction_type'] === 'DEPOSIT' ? 'CREDIT' : 'DEBIT',
                'amount' => $data['amount'],
                'description' => $data['description'] ?? null,
                'line_no' => 1,
            ]);

            return $transaction->load('entries');
        });
    }

    public function createMultiLine(
        array $data,
        array $entries,
        int $organizationId,
        int $userId,
        ?int $branchId = null,
    ): FinancialTransaction {
        return DB::transaction(function () use ($data, $entries, $organizationId, $userId, $branchId) {
            $accountIds = collect($entries)->pluck('financial_account_id')->unique()->values();
            $accounts = FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('id', $accountIds)
                ->get()
                ->keyBy('id');

            if ($accounts->count() !== $accountIds->count()) {
                throw new RuntimeException('All transaction accounts must belong to the active organization.');
            }

            foreach ($accounts as $account) {
                if (!in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
                    throw new RuntimeException('Transactions cannot be created for this account status.');
                }
            }

            $total = collect($entries)->sum(fn(array $entry): float => (float) $entry['amount']);
            $debitTotal = collect($entries)
                ->where('direction', 'DEBIT')
                ->sum(fn(array $entry): float => (float) $entry['amount']);
            $creditTotal = collect($entries)
                ->where('direction', 'CREDIT')
                ->sum(fn(array $entry): float => (float) $entry['amount']);

            if ($total <= 0 || abs($debitTotal - $creditTotal) > 0.0001) {
                throw new RuntimeException('Financial transaction entries must be balanced and greater than zero.');
            }

            $transaction = FinancialTransaction::create([
                'organization_id' => $organizationId,
                'branch_id' => $branchId,
                'transaction_no' => $this->nextNumber($organizationId),
                'transaction_type' => $data['transaction_type'],
                'transaction_date' => $data['transaction_date'],
                'amount' => $total,
                'currency' => $data['currency'] ?? 'BDT',
                'status' => 'PENDING',
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'created_by' => $userId,
            ]);

            $transaction->entries()->createMany(
                collect($entries)->values()->map(fn(array $entry, int $index): array => [
                    'financial_account_id' => $entry['financial_account_id'],
                    'direction' => $entry['direction'],
                    'amount' => $entry['amount'],
                    'description' => $entry['description'] ?? null,
                    'line_no' => $index + 1,
                ])->all(),
            );

            return $transaction->load('entries');
        });
    }

    public function createTransfer(array $data, int $organizationId, int $userId): FinancialTransaction
    {
        $source = FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($data['source_account_id']);
        $destination = FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($data['destination_account_id']);

        if ($source->id === $destination->id) {
            throw new RuntimeException('The source and destination accounts must be different.');
        }

        return $this->createMultiLine(
            [
                'transaction_type' => 'TRANSFER',
                'transaction_date' => $data['transaction_date'],
                'currency' => $data['currency'] ?? 'BDT',
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
            ],
            [
                [
                    'financial_account_id' => $source->id,
                    'direction' => $this->directionForDecrease($source),
                    'amount' => $data['amount'],
                    'description' => 'Transfer source',
                ],
                [
                    'financial_account_id' => $destination->id,
                    'direction' => $this->directionForIncrease($destination),
                    'amount' => $data['amount'],
                    'description' => 'Transfer destination',
                ],
            ],
            $organizationId,
            $userId,
            $source->branch_id,
        );
    }

    public function createLoanDisbursement(array $data, int $organizationId, int $userId): FinancialTransaction
    {
        return DB::transaction(function () use ($data, $organizationId, $userId) {
            $loan = LoanAccount::query()
                ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $organizationId))
                ->whereIn('status', ['APPROVED', 'PARTIALLY_DISBURSED'])
                ->lockForUpdate()
                ->findOrFail($data['loan_account_id']);
            $payoutAccount = FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('account_type', ['CASH', 'BANK'])
                ->whereIn('status', ['PENDING', 'ACTIVE'])
                ->findOrFail($data['payout_account_id']);
            $amount = (float) $data['amount'];
            $remaining = (float) $loan->principal_amount - (float) $loan->disbursed_amount;

            if ($amount > $remaining) {
                throw new RuntimeException('The disbursement amount exceeds the remaining approved loan amount.');
            }

            $transaction = $this->createMultiLine(
                [
                    'transaction_type' => 'LOAN_DISBURSEMENT',
                    'transaction_date' => $data['disbursed_at'],
                    'reference' => $data['reference'] ?? null,
                    'description' => $data['note'] ?? null,
                ],
                [
                    [
                        'financial_account_id' => $loan->financial_account_id,
                        'direction' => $this->directionForIncrease($loan->financialAccount),
                        'amount' => $amount,
                        'description' => 'Loan principal disbursement',
                    ],
                    [
                        'financial_account_id' => $payoutAccount->id,
                        'direction' => $this->directionForDecrease($payoutAccount),
                        'amount' => $amount,
                        'description' => 'Loan payout',
                    ],
                ],
                $organizationId,
                $userId,
                $loan->financialAccount->branch_id,
            );

            $disbursement = LoanDisbursement::create([
                'loan_account_id' => $loan->id,
                'financial_transaction_id' => $transaction->id,
                'amount' => $amount,
                'disbursed_at' => $data['disbursed_at'],
                'status' => 'PENDING',
                'created_by' => $userId,
                'note' => $data['note'] ?? null,
            ]);

            $transaction->update([
                'source_type' => LoanDisbursement::class,
                'source_id' => $disbursement->id,
            ]);

            return $transaction->fresh(['entries.financialAccount', 'source']);
        });
    }

    public function post(FinancialTransaction $transaction, int $organizationId, int $userId): FinancialTransaction
    {
        return DB::transaction(function () use ($transaction, $organizationId, $userId) {
            $transaction->load(['entries', 'source']);

            if ($transaction->organization_id !== $organizationId) {
                abort(404);
            }

            if ($transaction->status !== 'PENDING') {
                throw new RuntimeException('Only pending transactions can be posted.');
            }

            foreach ($transaction->entries->sortBy('line_no') as $entry) {
                $account = FinancialAccount::query()
                    ->with('product')
                    ->lockForUpdate()
                    ->findOrFail($entry->financial_account_id);
                $newBalance = $this->balanceAfterEntry($account, $entry->direction, (float) $entry->amount);
                if ($newBalance < 0) {
                    throw new RuntimeException('The account does not have enough available balance.');
                }

                $account->update([
                    'balance' => $newBalance,
                    'available_balance' => $newBalance,
                ]);
                $entry->update(['balance_after' => $newBalance]);
            }
            $transaction->update(['status' => 'POSTED', 'posted_by' => $userId, 'posted_at' => now()]);

            if ($transaction->source instanceof LoanDisbursement) {
                $disbursement = $transaction->source->load('loanAccount');
                $loan = LoanAccount::query()->lockForUpdate()->findOrFail($disbursement->loan_account_id);
                $loan->update([
                    'disbursed_amount' => (float) $loan->disbursed_amount + (float) $disbursement->amount,
                    'disbursed_at' => $disbursement->disbursed_at,
                    'status' => ((float) $loan->disbursed_amount + (float) $disbursement->amount) >= (float) $loan->principal_amount
                        ? 'ACTIVE'
                        : 'PARTIALLY_DISBURSED',
                ]);
                $disbursement->update(['status' => 'POSTED']);
            }

            return $transaction->fresh(['entries.financialAccount']);
        });
    }

    public function reverse(FinancialTransaction $transaction, int $organizationId): FinancialTransaction
    {
        return DB::transaction(function () use ($transaction, $organizationId) {
            if ($transaction->organization_id !== $organizationId) {
                abort(404);
            }

            if ($transaction->status !== 'POSTED') {
                throw new RuntimeException('Only posted transactions can be reversed.');
            }

            $transaction->load('entries');
            foreach ($transaction->entries->sortBy('line_no') as $entry) {
                $account = FinancialAccount::query()
                    ->with('product')
                    ->lockForUpdate()
                    ->findOrFail($entry->financial_account_id);
                $oppositeDirection = $entry->direction === 'DEBIT' ? 'CREDIT' : 'DEBIT';
                $newBalance = $this->balanceAfterEntry($account, $oppositeDirection, (float) $entry->amount);
                if ($newBalance < 0) {
                    throw new RuntimeException('The reversal would create a negative balance.');
                }

                $account->update(['balance' => $newBalance, 'available_balance' => $newBalance]);
            }
            $transaction->update(['status' => 'REVERSED']);

            return $transaction->fresh(['entries.financialAccount']);
        });
    }

    public function queryForOrganization(int $organizationId): Builder
    {
        return FinancialTransaction::query()->where('organization_id', $organizationId);
    }

    private function nextNumber(int $organizationId): string
    {
        $next = ((int) FinancialTransaction::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return sprintf('FT-%06d', $next);
    }

    private function balanceAfterEntry(FinancialAccount $account, string $direction, float $amount): float
    {
        $isAsset = $this->isAssetAccount($account);
        $increases = $isAsset ? $direction === 'DEBIT' : $direction === 'CREDIT';

        return (float) $account->balance + ($increases ? $amount : -$amount);
    }

    private function directionForIncrease(FinancialAccount $account): string
    {
        return $this->isAssetAccount($account) ? 'DEBIT' : 'CREDIT';
    }

    private function directionForDecrease(FinancialAccount $account): string
    {
        return $this->isAssetAccount($account) ? 'CREDIT' : 'DEBIT';
    }

    private function isAssetAccount(FinancialAccount $account): bool
    {
        return in_array($account->account_type, ['CASH', 'BANK'], true)
            || $account->product?->balance_type === 'ASSET';
    }
}