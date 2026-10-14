<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanArrear;
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
        if ($loan->repayments->contains(fn($repayment) => $repayment->status === 'POSTED')) {
            throw new RuntimeException('A schedule with posted repayments cannot be regenerated.');
        }

        $settings = $loan->financialAccount?->product?->settings ?? [];
        $frequency = strtoupper((string) ($data['frequency'] ?? $settings['repayment_frequency'] ?? 'MONTHLY'));
        if (!in_array($frequency, ['WEEKLY', 'MONTHLY', 'QUARTERLY'], true)) {
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
                $outstanding = $schedule->components->mapWithKeys(fn($component) => [
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
        if (!in_array($resolution, ['RESOLVED', 'WAIVED', 'RESTRUCTURED', 'WRITTEN_OFF'], true)) {
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