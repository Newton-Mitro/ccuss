<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\RecurringDeposit;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\FinancialServices\Application\FinancialTransactionService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RecurringDepositService
{
    public function __construct(private readonly FinancialTransactionService $transactionService)
    {
    }

    public function open(FinancialAccount $account, array $data): RecurringDeposit
    {
        if ($account->account_type !== 'RECURRING_DEPOSIT') {
            throw new RuntimeException('Recurring-deposit contracts require a recurring-deposit account.');
        }

        if (!in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
            throw new RuntimeException('A recurring-deposit contract cannot be opened for this account status.');
        }

        if ($account->recurringDeposit()->exists()) {
            throw new RuntimeException('This account already has a recurring-deposit contract.');
        }

        $startedAt = CarbonImmutable::parse($data['started_at']);
        $totalInstallments = (int) $data['total_installments'];
        $frequency = $data['installment_frequency'];
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
                'status' => 'ACTIVE',
            ]);

            $recurringDeposit->installments()->createMany(collect(range(1, $totalInstallments))->map(fn(int $number): array => [
                'installment_no' => $number,
                'due_date' => $this->dueDate($startedAt, $frequency, $number - 1)->toDateString(),
                'amount_due' => $data['installment_amount'],
                'status' => 'PENDING',
            ])->all());

            return $recurringDeposit->load('installments');
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

    public function waive(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment): RecurringDepositInstallment
    {
        $this->assertInstallment($recurringDeposit, $installment);

        if (!in_array($installment->status, ['PENDING', 'MISSED'], true)) {
            throw new RuntimeException('Only pending or missed installments can be waived.');
        }

        $installment->update(['status' => 'WAIVED']);

        return $installment->refresh();
    }

    public function collectPayment(RecurringDeposit $recurringDeposit, RecurringDepositInstallment $installment, array $data, int $organizationId, int $userId): \App\FinancialServices\Models\FinancialTransaction
    {
        $this->assertInstallment($recurringDeposit, $installment);
        if (!in_array($installment->status, ['PENDING', 'PARTIAL'], true)) {
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