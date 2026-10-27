<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanArrear;
use App\FinancialServices\Models\LoanSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LoanScheduleService
{
    public function generate(LoanAccount $loan, array $data = []): array
    {
        if (in_array($loan->status, ['CLOSED', 'WRITTEN_OFF'], true)) {
            throw new RuntimeException('Closed loans cannot generate repayment schedules.');
        }

        $loan->loadMissing(['financialAccount.product', 'protectionPolicy', 'schedules.components', 'repayments']);
        if ($loan->repayments->contains(fn ($repayment) => $repayment->status === 'POSTED')) {
            throw new RuntimeException('A schedule with posted repayments cannot be regenerated.');
        }

        $settings = $loan->financialAccount?->product?->settings ?? [];
        $frequency = strtoupper((string) ($data['frequency'] ?? $settings['repayment_frequency'] ?? 'MONTHLY'));
        if (! in_array($frequency, ['WEEKLY', 'MONTHLY', 'QUARTERLY'], true)) {
            throw new RuntimeException('Loan repayment frequency must be weekly, monthly, or quarterly.');
        }

        $termMonths = max(1, (int) ($data['term_months'] ?? $loan->term_value));
        $periods = $frequency === 'WEEKLY'
            ? (int) ceil($termMonths * 52 / 12)
            : ($frequency === 'QUARTERLY' ? (int) ceil($termMonths / 3) : $termMonths);
        $principal = (float) $loan->principal_amount;
        $annualRate = (float) $loan->contractual_rate;
        $calculation = $loan->interest_calculation;
        $startDate = CarbonImmutable::parse($data['start_date'] ?? $loan->disbursed_at ?? $loan->approved_at ?? now());
        $version = ((int) $loan->schedules->max('schedule_version')) + 1;
        $fee = (float) ($data['scheduled_fee'] ?? $settings['loan_fee_per_installment'] ?? 0);
        $protectionRate = $loan->protectionPolicy?->status === 'ACTIVE'
            ? $loan->protectionPolicy->monthly_rate_percent
            : null;
        $fixedProtectionFee = (float) ($data['scheduled_protection_fee'] ?? $settings['protection_fee_per_installment'] ?? 0);
        $periodsPerYear = match ($frequency) {
            'WEEKLY' => 52,
            'QUARTERLY' => 4,
            default => 12,
        };
        $protectionPeriodRate = $protectionRate === null
            ? null
            : (float) $protectionRate * 12 / $periodsPerYear;
        $inputs = [
            'frequency' => $frequency,
            'term_value' => $termMonths,
            'term_unit' => 'MONTH',
            'start_date' => $startDate->toDateString(),
            'principal' => round($principal, 4),
            'annual_rate' => round($annualRate, 6),
            'interest_calculation' => $calculation,
            'scheduled_fee' => round($fee, 4),
            'scheduled_protection_fee' => round($fixedProtectionFee, 4),
            'monthly_protection_rate_percent' => $protectionRate === null ? null : round((float) $protectionRate, 4),
        ];

        return DB::transaction(function () use ($loan, $frequency, $periods, $principal, $annualRate, $calculation, $startDate, $version, $fee, $fixedProtectionFee, $protectionPeriodRate, $inputs): array {
            $loan->schedules()->delete();
            $openingPrincipal = $principal;

            for ($index = 1; $index <= $periods; $index++) {
                $periodRate = match ($frequency) {
                    'WEEKLY' => $annualRate / 100 / 52,
                    'QUARTERLY' => $annualRate / 100 / 4,
                    default => $annualRate / 100 / 12,
                };
                $remainingPeriods = $periods - $index + 1;
                $scheduledPrincipal = $index === $periods
                    ? round($openingPrincipal, 4)
                    : round($principal / $periods, 4);
                $scheduledInterest = match ($calculation) {
                    'REDUCING_BALANCE' => round($openingPrincipal * $periodRate, 4),
                    'FLAT', 'SIMPLE' => round(($principal * $annualRate / 100 * $this->periodYears($frequency, $periods)) / $periods, 4),
                    default => 0.0,
                };
                $dueDate = $this->dueDate($startDate, $frequency, $index);
                $closingPrincipal = max(0, round($openingPrincipal - $scheduledPrincipal, 4));
                $protectionFee = $protectionPeriodRate === null
                    ? $fixedProtectionFee
                    : round($closingPrincipal * $protectionPeriodRate / 100, 2);
                $totalDue = round($scheduledPrincipal + $scheduledInterest + $fee + $protectionFee, 4);
                $schedule = $loan->schedules()->create([
                    'schedule_version' => $version,
                    'installment_no' => $index,
                    'due_date' => $dueDate->toDateString(),
                    'opening_principal' => round($openingPrincipal, 4),
                    'scheduled_principal' => $scheduledPrincipal,
                    'scheduled_interest' => $scheduledInterest,
                    'scheduled_fee' => $fee,
                    'scheduled_protection_fee' => $protectionFee,
                    'total_due' => $totalDue,
                    'total_paid' => 0,
                    'status' => 'PENDING',
                    'generation_inputs' => $inputs,
                ]);
                foreach ([
                    'PRINCIPAL' => $scheduledPrincipal,
                    'INTEREST' => $scheduledInterest,
                    'FEE' => $fee,
                    'PROTECTION_FEE' => $protectionFee,
                ] as $type => $amount) {
                    $schedule->components()->create(['type' => $type, 'amount_due' => $amount, 'amount_paid' => 0, 'status' => $amount > 0 ? 'PENDING' : 'PAID']);
                }
                $openingPrincipal = $closingPrincipal;
            }

            return $loan->schedules()->with('components')->orderBy('installment_no')->get()->all();
        });
    }

    public function addInstallment(LoanAccount $loan, array $data): LoanSchedule
    {
        if (in_array($loan->status, ['CLOSED', 'WRITTEN_OFF'], true)) {
            throw new RuntimeException('Closed loans cannot have repayment installments added.');
        }

        return DB::transaction(function () use ($loan, $data): LoanSchedule {
            $lockedLoan = LoanAccount::query()->lockForUpdate()->findOrFail($loan->id);
            $schedules = $lockedLoan->schedules()->lockForUpdate();
            $installmentNo = ((int) (clone $schedules)->max('installment_no')) + 1;
            $version = ((int) (clone $schedules)->max('schedule_version')) ?: 1;
            $lastInstallment = (clone $schedules)
                ->where('status', '!=', 'WAIVED')
                ->orderByDesc('installment_no')
                ->first();
            $openingPrincipal = $lastInstallment
                ? max(0, (float) $lastInstallment->opening_principal - (float) $lastInstallment->scheduled_principal)
                : (float) $lockedLoan->principal_amount;

            $amounts = [
                'scheduled_principal' => round((float) ($data['scheduled_principal'] ?? 0), 2),
                'scheduled_interest' => round((float) ($data['scheduled_interest'] ?? 0), 2),
                'scheduled_fee' => round((float) ($data['scheduled_fee'] ?? 0), 2),
                'scheduled_protection_fee' => round((float) ($data['scheduled_protection_fee'] ?? 0), 2),
            ];
            $totalDue = round(array_sum($amounts), 2);
            if ($totalDue <= 0) {
                throw new RuntimeException('Enter an amount greater than zero for the installment.');
            }

            $schedule = $lockedLoan->schedules()->create([
                'schedule_version' => $version,
                'installment_no' => $installmentNo,
                'due_date' => $data['due_date'],
                'opening_principal' => round($openingPrincipal, 2),
                ...$amounts,
                'total_due' => $totalDue,
                'total_paid' => 0,
                'status' => 'PENDING',
                'generation_inputs' => ['source' => 'MANUAL'],
            ]);

            foreach ([
                'PRINCIPAL' => $amounts['scheduled_principal'],
                'INTEREST' => $amounts['scheduled_interest'],
                'FEE' => $amounts['scheduled_fee'],
                'PROTECTION_FEE' => $amounts['scheduled_protection_fee'],
            ] as $type => $amount) {
                $schedule->components()->create([
                    'type' => $type,
                    'amount_due' => $amount,
                    'amount_paid' => 0,
                    'status' => $amount > 0 ? 'PENDING' : 'PAID',
                ]);
            }

            return $schedule->load('components');
        });
    }

    public function updateInstallment(LoanAccount $loan, LoanSchedule $schedule, array $data): LoanSchedule
    {
        if (in_array($loan->status, ['CLOSED', 'WRITTEN_OFF'], true)) {
            throw new RuntimeException('Closed loans cannot have repayment installments updated.');
        }

        return DB::transaction(function () use ($loan, $schedule, $data): LoanSchedule {
            $lockedLoan = LoanAccount::query()->lockForUpdate()->findOrFail($loan->id);
            $lockedSchedule = $lockedLoan->schedules()
                ->whereKey($schedule->id)
                ->lockForUpdate()
                ->first();
            if (! $lockedSchedule) {
                throw new RuntimeException('This installment does not belong to the loan.');
            }
            if ($lockedSchedule->status !== 'PENDING' || (float) $lockedSchedule->total_paid > 0) {
                throw new RuntimeException('Only pending installments without repayments can be updated.');
            }
            if ($lockedSchedule->allocations()->exists()) {
                throw new RuntimeException('Installments with repayment allocations cannot be updated.');
            }

            $components = $lockedSchedule->components()->lockForUpdate()->get()->keyBy('type');
            if ($components->contains(fn ($component) => (float) $component->amount_paid > 0)) {
                throw new RuntimeException('Installments with repayment allocations cannot be updated.');
            }

            $amounts = [
                'scheduled_principal' => round((float) ($data['scheduled_principal'] ?? 0), 2),
                'scheduled_interest' => round((float) ($data['scheduled_interest'] ?? 0), 2),
                'scheduled_fee' => round((float) ($data['scheduled_fee'] ?? 0), 2),
                'scheduled_protection_fee' => round((float) ($data['scheduled_protection_fee'] ?? 0), 2),
            ];
            $totalDue = round(array_sum($amounts), 2);
            if ($totalDue <= 0) {
                throw new RuntimeException('Enter an amount greater than zero for the installment.');
            }

            $lockedSchedule->update([
                'due_date' => $data['due_date'],
                ...$amounts,
                'total_due' => $totalDue,
            ]);

            foreach ([
                'PRINCIPAL' => $amounts['scheduled_principal'],
                'INTEREST' => $amounts['scheduled_interest'],
                'FEE' => $amounts['scheduled_fee'],
                'PROTECTION_FEE' => $amounts['scheduled_protection_fee'],
            ] as $type => $amount) {
                $component = $components->get($type);
                $values = [
                    'amount_due' => $amount,
                    'amount_paid' => 0,
                    'status' => $amount > 0 ? 'PENDING' : 'PAID',
                ];

                if ($component) {
                    $component->update($values);
                } else {
                    $lockedSchedule->components()->create([
                        'type' => $type,
                        ...$values,
                    ]);
                }
            }

            return $lockedSchedule->load('components');
        });
    }

    public function cancelInstallment(LoanAccount $loan, LoanSchedule $schedule, int $userId): LoanSchedule
    {
        return DB::transaction(function () use ($loan, $schedule, $userId): LoanSchedule {
            $lockedSchedule = $loan->schedules()
                ->whereKey($schedule->id)
                ->lockForUpdate()
                ->first();
            if (! $lockedSchedule) {
                throw new RuntimeException('This installment does not belong to the loan.');
            }
            if (in_array($lockedSchedule->status, ['PAID', 'WAIVED'], true) || (float) $lockedSchedule->total_paid > 0) {
                throw new RuntimeException('Paid or already cancelled installments cannot be cancelled.');
            }
            if ($lockedSchedule->allocations()->exists()
                || $lockedSchedule->components()->where('amount_paid', '>', 0)->exists()) {
                throw new RuntimeException('Installments with repayment allocations cannot be cancelled.');
            }

            $lockedSchedule->components()->update(['status' => 'WAIVED']);
            $lockedSchedule->update(['status' => 'WAIVED']);

            LoanArrear::query()
                ->where('loan_schedule_id', $lockedSchedule->id)
                ->whereIn('status', ['OPEN', 'PARTIALLY_CLEARED'])
                ->update([
                    'status' => 'CLEARED',
                    'resolution_type' => 'WAIVED',
                    'resolution_note' => 'Repayment installment cancelled.',
                    'resolved_at' => now(),
                    'resolved_by' => $userId,
                ]);

            return $lockedSchedule->load('components');
        });
    }

    public function assessArrears(LoanAccount $loan, ?string $asOfDate = null): array
    {
        if (in_array($loan->status, ['CLOSED', 'WRITTEN_OFF'], true)) {
            throw new RuntimeException('Closed loans cannot accrue arrears.');
        }

        $asOf = CarbonImmutable::parse($asOfDate ?? now()->toDateString());
        $loan->load('schedules.components');

        return DB::transaction(function () use ($loan, $asOf): array {
            $arrears = [];
            foreach ($loan->schedules as $schedule) {
                if ($schedule->due_date->greaterThanOrEqualTo($asOf) || $schedule->status === 'PAID') {
                    continue;
                }
                $outstanding = $schedule->components->mapWithKeys(fn ($component) => [
                    $component->type => max(0, (float) $component->amount_due - (float) $component->amount_paid),
                ]);
                $total = round($outstanding->sum(), 4);
                if ($total <= 0) {
                    continue;
                }
                $arrear = LoanArrear::query()
                    ->where('loan_account_id', $loan->id)
                    ->where('loan_schedule_id', $schedule->id)
                    ->whereDate('as_of_date', $asOf->toDateString())
                    ->first() ?? new LoanArrear([
                        'loan_account_id' => $loan->id,
                        'loan_schedule_id' => $schedule->id,
                        'as_of_date' => $asOf->toDateString(),
                    ]);
                $arrear->fill([
                    'days_overdue' => $schedule->due_date->diffInDays($asOf),
                    'principal_overdue' => $outstanding->get('PRINCIPAL', 0),
                    'interest_overdue' => $outstanding->get('INTEREST', 0),
                    'fee_overdue' => $outstanding->get('FEE', 0) + $outstanding->get('PROTECTION_FEE', 0),
                    'total_overdue' => $total,
                    'status' => (float) $schedule->total_paid > 0 ? 'PARTIALLY_CLEARED' : 'OPEN',
                ])->save();
                $arrears[] = $arrear;
                $schedule->update(['status' => (float) $schedule->total_paid > 0 ? 'PARTIAL' : 'OVERDUE']);
            }

            return $arrears;
        });
    }

    public function resolveArrear(LoanArrear $arrear, string $resolution, int $userId, ?string $note = null): LoanArrear
    {
        if (! in_array($resolution, ['RESOLVED', 'WAIVED', 'RESTRUCTURED', 'WRITTEN_OFF'], true)) {
            throw new RuntimeException('Invalid arrears resolution.');
        }
        if ($arrear->status === 'CLEARED') {
            throw new RuntimeException('This arrear has already been resolved.');
        }

        $arrear->update([
            'status' => 'CLEARED',
            'resolution_type' => $resolution,
            'resolution_note' => $note,
            'resolved_at' => now(),
            'resolved_by' => $userId,
        ]);

        return $arrear->refresh();
    }

    private function dueDate(CarbonImmutable $startDate, string $frequency, int $index): CarbonImmutable
    {
        return match ($frequency) {
            'WEEKLY' => $startDate->addWeeks($index),
            'QUARTERLY' => $startDate->addMonthsNoOverflow($index * 3),
            default => $startDate->addMonthsNoOverflow($index),
        };
    }

    private function periodYears(string $frequency, int $periods): float
    {
        return match ($frequency) {
            'WEEKLY' => $periods / 52,
            'QUARTERLY' => $periods / 4,
            default => $periods / 12,
        };
    }
}
