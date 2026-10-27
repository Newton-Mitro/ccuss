<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\RecurringDeposit;
use App\FinancialServices\Models\RecurringDepositInstallment;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class RecurringDepositService
{
    public function __construct(private readonly FinancialTransactionService $transactionService) {}

    public function open(FinancialAccount $account, array $data): RecurringDeposit
    {
        if ($account->account_type !== 'RECURRING_DEPOSIT') {
            throw new RuntimeException('Recurring-deposit contracts require a recurring-deposit account.');
        }

        if (! in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
            throw new RuntimeException('A recurring-deposit contract cannot be opened for this account status.');
        }

        if ($account->recurringDeposit()->exists()) {
            throw new RuntimeException('This account already has a recurring-deposit contract.');
        }

        $startedAt = CarbonImmutable::parse($data['started_at']);
        $productTerm = $account->depositProductTerm;
        [$frequency, $totalInstallments] = $productTerm
            ? match ($productTerm->tenure_unit) {
                'DAY' => ['WEEKLY', (int) ceil($productTerm->tenure_value / 7)],
                'WEEK' => ['WEEKLY', $productTerm->tenure_value],
                'MONTH' => ['MONTHLY', $productTerm->tenure_value],
                'QUARTER' => ['QUARTERLY', $productTerm->tenure_value],
                'YEAR' => ['MONTHLY', $productTerm->tenure_value * 12],
            }
        : [$data['installment_frequency'], (int) $data['total_installments']];
        $maturityDate = $this->dueDate($startedAt, $frequency, $totalInstallments - 1)
            ->addDays((int) ($data['maturity_extension_days'] ?? 0));

        return DB::transaction(function () use ($account, $data, $startedAt, $maturityDate, $totalInstallments, $frequency): RecurringDeposit {
            $recurringDeposit = $account->recurringDeposit()->create([
                'installment_amount' => $data['installment_amount'],
                'installment_frequency' => $frequency,
                'total_installments' => $totalInstallments,
                'paid_installments' => 0,
                'started_at' => $startedAt->toDateString(),
                'maturity_date' => $maturityDate->toDateString(),
                'maturity_extension_days' => $data['maturity_extension_days'] ?? 0,
                'grace_days' => $data['grace_days'] ?? 0,
                'contractual_rate' => $account->depositProductTerm?->interest_rate,
            ]);

            $recurringDeposit->installments()->createMany(collect(range(1, $totalInstallments))->map(fn (int $number): array => [
                'installment_no' => $number,
                'due_date' => $this->dueDate($startedAt, $frequency, $number - 1)->toDateString(),
                'amount_due' => $data['installment_amount'],
                'status' => 'PENDING',
            ])->all());

            return $recurringDeposit->load('installments');
        });
    }

    public function amend(RecurringDeposit $recurringDeposit, array $data): RecurringDeposit
    {
        $startedAt = CarbonImmutable::parse($data['started_at']);
        $frequency = $data['installment_frequency'];
        $totalInstallments = (int) $data['total_installments'];
        $installmentAmount = (float) $data['installment_amount'];
        $extensionDays = (int) ($data['maturity_extension_days'] ?? 0);
        $graceDays = (int) ($data['grace_days'] ?? 0);

        return DB::transaction(function () use ($recurringDeposit, $startedAt, $frequency, $totalInstallments, $installmentAmount, $extensionDays, $graceDays): RecurringDeposit {
            $deposit = RecurringDeposit::query()->lockForUpdate()->findOrFail($recurringDeposit->id);
            if ($deposit->closed_at !== null) {
                throw new RuntimeException('A closed recurring-deposit contract cannot be amended.');
            }
            $scheduleChanged = $deposit->started_at->toDateString() !== $startedAt->toDateString()
                || $deposit->installment_frequency !== $frequency
                || (int) $deposit->total_installments !== $totalInstallments
                || (float) $deposit->installment_amount !== $installmentAmount;

            if ($scheduleChanged && $deposit->installments()
                ->where(fn ($query) => $query
                    ->where('status', '!=', 'PENDING')
                    ->orWhereNotNull('financial_transaction_id')
                    ->orWhere('amount_paid', '>', 0))
                ->exists()) {
                $changedField = match (true) {
                    $deposit->started_at->toDateString() !== $startedAt->toDateString() => 'started_at',
                    $deposit->installment_frequency !== $frequency => 'installment_frequency',
                    (int) $deposit->total_installments !== $totalInstallments => 'total_installments',
                    default => 'installment_amount',
                };

                throw ValidationException::withMessages([
                    $changedField => 'The installment schedule cannot be changed after installment history has been recorded.',
                ]);
            }

            $maturityDate = $this->dueDate($startedAt, $frequency, $totalInstallments - 1)
                ->addDays($extensionDays);

            $deposit->update([
                'installment_amount' => $installmentAmount,
                'installment_frequency' => $frequency,
                'total_installments' => $totalInstallments,
                'started_at' => $startedAt->toDateString(),
                'maturity_date' => $maturityDate->toDateString(),
                'maturity_extension_days' => $extensionDays,
                'grace_days' => $graceDays,
            ]);

            if ($scheduleChanged) {
                $deposit->installments()->delete();
                $deposit->installments()->createMany(collect(range(1, $totalInstallments))->map(fn (int $number): array => [
                    'installment_no' => $number,
                    'due_date' => $this->dueDate($startedAt, $frequency, $number - 1)->toDateString(),
                    'amount_due' => $installmentAmount,
                    'status' => 'PENDING',
                ])->all());
            }

            return $deposit->refresh()->load('installments');
        });
    }

    public function markMissed(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment): RecurringDepositInstallment
    {
        $this->assertInstallment($recurringDeposit, $installment);

        if ($installment->status !== 'PENDING' || $installment->due_date->isFuture()) {
            throw new RuntimeException('Only due pending installments can be marked missed.');
        }

        $installment->update(['status' => 'MISSED']);

        return $installment->refresh();
    }

    public function addInstallment(RecurringDeposit $recurringDeposit, array $data): RecurringDepositInstallment
    {
        return DB::transaction(function () use ($recurringDeposit, $data): RecurringDepositInstallment {
            $deposit = RecurringDeposit::query()->lockForUpdate()->findOrFail($recurringDeposit->id);
            if ($deposit->closed_at !== null) {
                throw new RuntimeException('A closed recurring-deposit contract cannot have installments added.');
            }
            if ($deposit->total_installments >= 600) {
                throw ValidationException::withMessages([
                    'schedule' => 'The recurring-deposit schedule cannot exceed 600 installments.',
                ]);
            }

            $installmentNo = (int) $deposit->installments()->max('installment_no') + 1;
            $installment = $deposit->installments()->create([
                'installment_no' => $installmentNo,
                'due_date' => $data['due_date'],
                'amount_due' => $data['amount_due'],
                'status' => 'PENDING',
            ]);

            $deposit->update([
                'total_installments' => $installmentNo,
                'maturity_date' => CarbonImmutable::parse($data['due_date'])
                    ->addDays((int) $deposit->maturity_extension_days)
                    ->toDateString(),
            ]);

            return $installment;
        });
    }

    public function updateInstallment(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment, array $data): RecurringDepositInstallment
    {
        $this->assertInstallment($recurringDeposit, $installment);

        return DB::transaction(function () use ($recurringDeposit, $installment, $data): RecurringDepositInstallment {
            $deposit = RecurringDeposit::query()->lockForUpdate()->findOrFail($recurringDeposit->id);
            if ($deposit->closed_at !== null) {
                throw new RuntimeException('A closed recurring-deposit contract cannot be amended.');
            }

            $lockedInstallment = $deposit->installments()
                ->whereKey($installment->id)
                ->lockForUpdate()
                ->firstOrFail();
            if ($lockedInstallment->status !== 'PENDING'
                || $lockedInstallment->financial_transaction_id !== null
                || (float) $lockedInstallment->amount_paid > 0
                || $lockedInstallment->transactionEntries()->exists()) {
                throw new RuntimeException('Only pending installments without payment history can be updated.');
            }

            $lockedInstallment->update([
                'due_date' => $data['due_date'],
                'amount_due' => $data['amount_due'],
            ]);

            if ((int) $lockedInstallment->installment_no === (int) $deposit->total_installments) {
                $deposit->update([
                    'maturity_date' => CarbonImmutable::parse($data['due_date'])
                        ->addDays((int) $deposit->maturity_extension_days)
                        ->toDateString(),
                ]);
            }

            return $lockedInstallment->refresh();
        });
    }

    public function waive(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment): RecurringDepositInstallment
    {
        $this->assertInstallment($recurringDeposit, $installment);

        if (! in_array($installment->status, ['PENDING', 'MISSED'], true)) {
            throw new RuntimeException('Only pending or missed installments can be waived.');
        }
        if ($installment->financial_transaction_id !== null
            || (float) $installment->amount_paid > 0
            || $installment->transactionEntries()->exists()) {
            throw new RuntimeException('Installments with payment history cannot be cancelled.');
        }

        $installment->update(['status' => 'WAIVED']);

        return $installment->refresh();
    }

    public function collectPayment(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment, array $data, int $organizationId, int $userId): \App\FinancialServices\Models\FinancialTransaction
    {
        $this->assertInstallment($recurringDeposit, $installment);
        if (! in_array($installment->status, ['PENDING', 'PARTIAL'], true)) {
            throw new RuntimeException('Only pending or partial installments can receive payments.');
        }

        $amount = (float) $data['amount'];
        $outstanding = (float) $installment->amount_due - (float) $installment->amount_paid;
        if ($amount > $outstanding) {
            throw new RuntimeException('The installment payment exceeds the outstanding amount.');
        }

        if ($installment->financial_transaction_id) {
            return $installment->financialTransaction()->firstOrFail();
        }

        $account = $recurringDeposit->financialAccount()->firstOrFail();
        $transaction = $this->transactionService->create([
            'financial_account_id' => $account->id,
            'transaction_type' => 'DEPOSIT',
            'transaction_date' => $data['transaction_date'],
            'amount' => $amount,
            'currency' => $data['currency'] ?? 'BDT',
            'reference' => $data['reference'] ?? null,
            'description' => $data['description'] ?? 'Recurring-deposit installment payment',
            'idempotency_key' => $data['idempotency_key'] ?? null,
            'source_type' => RecurringDepositInstallment::class,
            'source_id' => $installment->id,
        ], $organizationId, $userId);
        $installment->update(['financial_transaction_id' => $transaction->id]);

        return $transaction;
    }

    private function dueDate(CarbonImmutable $startedAt, string $frequency, int $offset): CarbonImmutable
    {
        return match ($frequency) {
            'WEEKLY' => $startedAt->addWeeks($offset),
            'MONTHLY' => $startedAt->addMonthsNoOverflow($offset),
            'QUARTERLY' => $startedAt->addMonthsNoOverflow($offset * 3),
            default => throw new RuntimeException('Unsupported recurring-deposit frequency.'),
        };
    }

    private function assertInstallment(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment): void
    {
        if ($installment->recurring_deposit_id !== $recurringDeposit->id) {
            throw new RuntimeException('The installment does not belong to this recurring deposit.');
        }
    }
}
