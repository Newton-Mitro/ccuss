<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FixedDeposit;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class FixedDepositService
{
    public function open(FinancialAccount $account, array $data): FixedDeposit
    {
        if ($account->account_type !== 'FIXED_DEPOSIT') {
            throw new RuntimeException('Fixed-deposit contracts require a fixed-deposit account.');
        }

        if (!in_array($account->status, ['PENDING', 'ACTIVE'], true)) {
            throw new RuntimeException('A fixed-deposit contract cannot be opened for this account status.');
        }

        if ($account->fixedDeposit()->exists()) {
            throw new RuntimeException('This account already has a fixed-deposit contract.');
        }

        $startedAt = CarbonImmutable::parse($data['started_at']);
        $productTerm = $account->depositProductTerm;
        $termValue = (int) ($productTerm?->tenure_value ?? $data['term_value'] ?? $data['term_months']);
        $termUnit = $productTerm?->tenure_unit ?? $data['term_unit'] ?? 'MONTH';
        $maturityDate = match ($termUnit) {
            'DAY' => $startedAt->addDays($termValue),
            'WEEK' => $startedAt->addWeeks($termValue),
            'MONTH' => $startedAt->addMonthsNoOverflow($termValue),
            'QUARTER' => $startedAt->addMonthsNoOverflow($termValue * 3),
            'YEAR' => $startedAt->addYearsNoOverflow($termValue),
        };
        $principal = (float) $data['principal_amount'];
        $rate = (float) ($productTerm?->interest_rate ?? $data['contractual_rate']);
        $termMonths = match ($termUnit) {
            'DAY' => $termValue / 30,
            'WEEK' => $termValue / 4,
            'MONTH' => $termValue,
            'QUARTER' => $termValue * 3,
            'YEAR' => $termValue * 12,
        };
        $maturityAmount = round($principal * (1 + ($rate * $termMonths / 12 / 100)), 4);

        return DB::transaction(fn() => $account->fixedDeposit()->create([
            'principal_amount' => $principal,
            'contractual_rate' => $rate,
            'term_value' => $termValue,
            'term_unit' => $termUnit,
            'started_at' => $startedAt->toDateString(),
            'maturity_date' => $maturityDate->toDateString(),
            'maturity_amount' => $maturityAmount,
            'maturity_instruction' => $data['maturity_instruction'],
        ]));
    }
}
