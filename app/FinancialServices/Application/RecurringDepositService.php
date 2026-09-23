<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\RecurringDeposit;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RecurringDepositService
{
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

    private function dueDate(CarbonImmutable $startedAt, string $frequency, int $offset): CarbonImmutable
    {
        return match ($frequency) {
            'WEEKLY' => $startedAt->addWeeks($offset),
            'MONTHLY' => $startedAt->addMonthsNoOverflow($offset),
            'QUARTERLY' => $startedAt->addMonthsNoOverflow($offset * 3),
            default => throw new RuntimeException('Unsupported recurring-deposit frequency.'),
        };
    }
}