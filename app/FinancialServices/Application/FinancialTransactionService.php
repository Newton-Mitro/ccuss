<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Application\FinancialProductPolicyService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanDisbursement;
use App\FinancialServices\Models\LoanRepayment;
use App\FinancialServices\Models\AccountFine;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\TreasuryAndCash\Models\BranchDay;
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
                'source_type' => $data['source_type'] ?? null,
                'source_id' => $data['source_id'] ?? null,
                'created_by' => $userId,
            ]);

            $transaction->entries()->create([
                'financial_account_id' => $account->id,
                'direction' => in_array($data['transaction_type'], ['DEPOSIT', 'FINE_PAYMENT'], true)
                    ? ($data['transaction_type'] === 'DEPOSIT' ? 'CREDIT' : $this->directionForDecrease($account))
                    : 'DEBIT',
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
            $total = collect($entries)->sum(fn(array $entry): float => (float) $entry['amount']);
            $existing = $this->findIdempotentTransaction($data['idempotency_key'] ?? null, $organizationId);
            if ($existing) {
                $existingEntries = $existing->entries->sortBy('line_no')->values();
                $sameEntries = $existingEntries->count() === count($entries)
                    && collect($entries)->values()->every(function (array $entry, int $index) use ($existingEntries): bool {
                        $existingEntry = $existingEntries->get($index);

                        return $existingEntry
                            && $existingEntry->financial_account_id === (int) $entry['financial_account_id']
                            && $existingEntry->direction === $entry['direction']
                            && (float) $existingEntry->amount === (float) $entry['amount'];
                    });

                if ($existing->transaction_type !== $data['transaction_type'] || (float) $existing->amount !== $total || !$sameEntries) {
                    throw new RuntimeException('The idempotency key is already used for a different transaction.');
                }

                return $existing;
            }

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
                'idempotency_key' => $data['idempotency_key'] ?? null,
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
                'idempotency_key' => $data['idempotency_key'] ?? null,
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
            $existing = $this->findIdempotentTransaction($data['idempotency_key'] ?? null, $organizationId);
            if ($existing) {
                if ($existing->transaction_type !== 'LOAN_DISBURSEMENT' || (float) $existing->amount !== (float) $data['amount'] * 2) {
                    throw new RuntimeException('The idempotency key is already used for a different transaction.');
                }

                return $existing;
            }

            $loan = LoanAccount::query()
                ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $organizationId))
                ->whereIn('status', ['APPROVED', 'PARTIALLY_DISBURSED'])
                ->with(['financialAccount', 'application.collaterals', 'application.guarantors', 'application.loanAccount.protectionPolicy'])
                ->lockForUpdate()
                ->findOrFail($data['loan_account_id']);
            $payoutAccount = FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('account_type', ['CASH', 'BANK'])
                ->whereIn('status', ['PENDING', 'ACTIVE'])
                ->findOrFail($data['payout_account_id']);
            $amount = (float) $data['amount'];
            $remaining = (float) $loan->principal_amount - (float) $loan->disbursed_amount;

            $this->validateLoanDisbursement($loan, $data['disbursed_at']);

            if ($amount > $remaining) {
                throw new RuntimeException('The disbursement amount exceeds the remaining approved loan amount.');
            }

            $transaction = $this->createMultiLine(
                [
                    'transaction_type' => 'LOAN_DISBURSEMENT',
                    'transaction_date' => $data['disbursed_at'],
                    'reference' => $data['reference'] ?? null,
                    'description' => $data['note'] ?? null,
                    'idempotency_key' => $data['idempotency_key'] ?? null,
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

    public function createFinePayment(array $data, int $organizationId, int $userId): FinancialTransaction
    {
        $fine = AccountFine::query()
            ->with('financialAccount')
            ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $organizationId))
            ->lockForUpdate()
            ->findOrFail($data['account_fine_id']);
        $outstanding = (float) $fine->assessed_amount - (float) $fine->waived_amount - (float) $fine->paid_amount;
        if ($fine->status === 'WAIVED' || $outstanding <= 0) {
            throw new RuntimeException('This fine has no payable balance.');
        }
        if ((float) $data['amount'] > $outstanding) {
            throw new RuntimeException('The fine payment exceeds the outstanding fine amount.');
        }

        $transaction = $this->create([
            'financial_account_id' => $fine->financial_account_id,
            'transaction_type' => 'FINE_PAYMENT',
            'transaction_date' => $data['payment_date'],
            'amount' => $data['amount'],
            'reference' => $data['reference'] ?? null,
            'description' => 'Fine payment',
            'idempotency_key' => $data['idempotency_key'] ?? null,
            'source_type' => AccountFine::class,
            'source_id' => $fine->id,
        ], $organizationId, $userId);

        $fine->update(['financial_transaction_id' => $transaction->id]);

        return $transaction->fresh(['entries.financialAccount', 'source']);
    }

    public function createLoanRepayment(array $data, int $organizationId, int $userId): FinancialTransaction
    {
        return DB::transaction(function () use ($data, $organizationId, $userId) {
            $existing = $this->findIdempotentTransaction($data['idempotency_key'] ?? null, $organizationId);
            if ($existing) {
                if ($existing->transaction_type !== 'LOAN_REPAYMENT' || (float) $existing->amount !== (float) $data['amount'] * 2) {
                    throw new RuntimeException('The idempotency key is already used for a different transaction.');
                }

                return $existing;
            }

            $loan = LoanAccount::query()
                ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $organizationId))
                ->whereIn('status', ['ACTIVE', 'PARTIALLY_DISBURSED'])
                ->with(['financialAccount', 'schedules.components'])
                ->lockForUpdate()
                ->findOrFail($data['loan_account_id']);
            $payoutAccount = FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('account_type', ['CASH', 'BANK'])
                ->whereIn('status', ['PENDING', 'ACTIVE'])
                ->findOrFail($data['payout_account_id']);
            $amount = (float) $data['amount'];
            $allocations = $this->repaymentAllocations($loan, $amount, $data['repayment_date'], (bool) ($data['allow_advance'] ?? false));
            if (round(collect($allocations)->sum('amount'), 4) < round($amount, 4)) {
                throw new RuntimeException('The repayment exceeds the outstanding scheduled balance.');
            }

            $transaction = $this->createMultiLine(
                [
                    'transaction_type' => 'LOAN_REPAYMENT',
                    'transaction_date' => $data['repayment_date'],
                    'reference' => $data['reference'] ?? null,
                    'description' => 'Loan repayment',
                    'idempotency_key' => $data['idempotency_key'] ?? null,
                ],
                [
                    ['financial_account_id' => $payoutAccount->id, 'direction' => $this->directionForIncrease($payoutAccount), 'amount' => $amount, 'description' => 'Loan repayment received'],
                    ['financial_account_id' => $loan->financial_account_id, 'direction' => $this->directionForDecrease($loan->financialAccount), 'amount' => $amount, 'description' => 'Loan balance repayment'],
                ],
                $organizationId,
                $userId,
                $loan->financialAccount->branch_id,
            );
            $repayment = LoanRepayment::create([
                'loan_account_id' => $loan->id,
                'financial_transaction_id' => $transaction->id,
                'amount' => $amount,
                'repayment_date' => $data['repayment_date'],
                'status' => 'PENDING',
                'reference' => $data['reference'] ?? null,
                'created_by' => $userId,
            ]);
            foreach ($allocations as $allocation) {
                $repayment->allocations()->create($allocation);
            }
            $transaction->update(['source_type' => LoanRepayment::class, 'source_id' => $repayment->id]);

            return $transaction->fresh(['entries.financialAccount', 'source.allocations']);
        });
    }

    private function findIdempotentTransaction(?string $idempotencyKey, int $organizationId): ?FinancialTransaction
    {
        if (!$idempotencyKey) {
            return null;
        }

        return FinancialTransaction::query()
            ->where('organization_id', $organizationId)
            ->where('idempotency_key', $idempotencyKey)
            ->with('entries')
            ->first();
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

            if ($transaction->source instanceof LoanRepayment) {
                $this->postLoanRepayment($transaction->source);
            }

            if ($transaction->source instanceof AccountFine) {
                $fine = AccountFine::query()->lockForUpdate()->findOrFail($transaction->source->id);
                $paidAmount = (float) $fine->paid_amount + (float) $transaction->amount;
                $fine->update([
                    'paid_amount' => $paidAmount,
                    'status' => $paidAmount + (float) $fine->waived_amount >= (float) $fine->assessed_amount ? 'PAID' : 'PARTIALLY_PAID',
                ]);
            }

            if ($transaction->source instanceof RecurringDepositInstallment) {
                $installment = RecurringDepositInstallment::query()
                    ->with('recurringDeposit')
                    ->lockForUpdate()
                    ->findOrFail($transaction->source->id);
                $amountPaid = (float) $installment->amount_paid + (float) $transaction->amount;
                if ($amountPaid > (float) $installment->amount_due) {
                    throw new RuntimeException('The installment payment exceeds the amount due.');
                }

                $isPaid = $amountPaid >= (float) $installment->amount_due;
                $installment->update([
                    'amount_paid' => $amountPaid,
                    'status' => $isPaid ? 'PAID' : 'PARTIAL',
                    'paid_at' => $isPaid ? now() : null,
                ]);
                if ($isPaid) {
                    $installment->recurringDeposit()->increment('paid_installments');
                }
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

            $transaction->load(['entries', 'source']);
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

            if ($transaction->source instanceof LoanDisbursement) {
                $disbursement = $transaction->source;
                $loan = LoanAccount::query()->lockForUpdate()->findOrFail($disbursement->loan_account_id);
                $disbursedAmount = max(0, (float) $loan->disbursed_amount - (float) $disbursement->amount);
                $loan->update([
                    'disbursed_amount' => $disbursedAmount,
                    'disbursed_at' => $disbursedAmount > 0 ? $loan->disbursed_at : null,
                    'status' => $disbursedAmount >= (float) $loan->principal_amount
                        ? 'ACTIVE'
                        : ($disbursedAmount > 0 ? 'PARTIALLY_DISBURSED' : 'APPROVED'),
                ]);
                $disbursement->update(['status' => 'CANCELLED']);
            }

            if ($transaction->source instanceof LoanRepayment) {
                $this->reverseLoanRepayment($transaction->source);
            }

            if ($transaction->source instanceof AccountFine) {
                $fine = AccountFine::query()->lockForUpdate()->findOrFail($transaction->source->id);
                $paidAmount = max(0, (float) $fine->paid_amount - (float) $transaction->amount);
                $fine->update(['paid_amount' => $paidAmount, 'status' => $paidAmount > 0 ? 'PARTIALLY_PAID' : 'ASSESSED']);
            }

            return $transaction->fresh(['entries.financialAccount']);
        });
    }

    public function queryForOrganization(int $organizationId): Builder
    {
        return FinancialTransaction::query()->where('organization_id', $organizationId);
    }

    private function repaymentAllocations(LoanAccount $loan, float $amount, string $repaymentDate, bool $allowAdvance): array
    {
        $remaining = $amount;
        $allocations = [];
        $schedules = $loan->schedules
            ->filter(fn($schedule) => !in_array($schedule->status, ['PAID', 'WAIVED'], true))
            ->filter(fn($schedule) => $allowAdvance || $schedule->due_date->toDateString() <= $repaymentDate)
            ->sortBy('due_date');

        foreach ($schedules as $schedule) {
            foreach (['FEE', 'PROTECTION_FEE', 'INTEREST', 'PRINCIPAL'] as $type) {
                $component = $schedule->components->firstWhere('type', $type);
                if (!$component) {
                    continue;
                }
                $outstanding = max(0, (float) $component->amount_due - (float) $component->amount_paid);
                $allocated = min($remaining, $outstanding);
                if ($allocated > 0) {
                    $allocations[] = [
                        'loan_schedule_id' => $schedule->id,
                        'loan_schedule_component_id' => $component->id,
                        'amount' => round($allocated, 4),
                    ];
                    $remaining = round($remaining - $allocated, 4);
                }
                if ($remaining <= 0) {
                    return $allocations;
                }
            }
        }

        return $allocations;
    }

    private function postLoanRepayment(LoanRepayment $repayment): void
    {
        $repayment->load(['allocations.component', 'allocations.schedule']);
        foreach ($repayment->allocations as $allocation) {
            $component = $allocation->component;
            $paid = min((float) $component->amount_due, (float) $component->amount_paid + (float) $allocation->amount);
            $component->update(['amount_paid' => $paid, 'status' => $paid >= (float) $component->amount_due ? 'PAID' : 'PARTIAL']);
            $schedule = $allocation->schedule->fresh('components');
            $totalPaid = $schedule->components->sum(fn($item) => (float) $item->amount_paid);
            $fullyPaid = $totalPaid >= (float) $schedule->total_due;
            $schedule->update(['total_paid' => $totalPaid, 'status' => $fullyPaid ? 'PAID' : 'PARTIAL', 'paid_at' => $fullyPaid ? now() : null]);
        }
        $repayment->update(['status' => 'POSTED']);
    }

    private function reverseLoanRepayment(LoanRepayment $repayment): void
    {
        $repayment->load(['allocations.component', 'allocations.schedule']);
        foreach ($repayment->allocations as $allocation) {
            $component = $allocation->component;
            $paid = max(0, (float) $component->amount_paid - (float) $allocation->amount);
            $component->update(['amount_paid' => $paid, 'status' => $paid <= 0 ? 'PENDING' : 'PARTIAL']);
            $schedule = $allocation->schedule->fresh('components');
            $totalPaid = $schedule->components->sum(fn($item) => (float) $item->amount_paid);
            $schedule->update(['total_paid' => $totalPaid, 'status' => $totalPaid <= 0 ? 'PENDING' : 'PARTIAL', 'paid_at' => null]);
        }
        $repayment->update(['status' => 'REVERSED']);
    }

    private function nextNumber(int $organizationId): string
    {
        $next = ((int) FinancialTransaction::query()->where('organization_id', $organizationId)->lockForUpdate()->max('id')) + 1;

        return sprintf('FT-%06d', $next);
    }

    private function validateLoanDisbursement(LoanAccount $loan, string $disbursedAt): void
    {
        $application = $loan->application;
        if ($application) {
            if ($application->status !== 'APPROVED') {
                throw new RuntimeException('The loan application must be approved before disbursement.');
            }
            if ($application->collaterals->contains(fn($collateral) => $collateral->status === 'PENDING')) {
                throw new RuntimeException('All collateral must be verified or rejected before disbursement.');
            }
            if ($application->guarantors->contains(fn($guarantor) => $guarantor->status === 'PENDING')) {
                throw new RuntimeException('All guarantor invitations must be decided before disbursement.');
            }
            $protection = $loan->protectionPolicy;
            if ($protection?->required && $protection->status !== 'ACTIVE') {
                throw new RuntimeException('Required loan protection must be active before disbursement.');
            }
        }

        if (
            $loan->financialAccount->branch_id && !BranchDay::query()
                ->where('branch_id', $loan->financialAccount->branch_id)
                ->whereDate('business_date', $disbursedAt)
                ->where('status', BranchDay::STATUS_OPEN)
                ->exists()
        ) {
            throw new RuntimeException('The branch day must be open for the disbursement date.');
        }
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