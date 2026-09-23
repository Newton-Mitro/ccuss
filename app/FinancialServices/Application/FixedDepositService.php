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
        $maturityDate = $startedAt->addMonthsNoOverflow((int) $data['term_months']);
        $principal = (float) $data['principal_amount'];
        $rate = (float) $data['contractual_rate'];
        $maturityAmount = round($principal * (1 + ($rate * (int) $data['term_months'] / 12 / 100)), 4);

        return DB::transaction(fn() => $account->fixedDeposit()->create([
            'principal_amount' => $principal,
            'contractual_rate' => $rate,
            'term_months' => $data['term_months'],
            'started_at' => $startedAt->toDateString(),
            'maturity_date' => $maturityDate->toDateString(),
            'maturity_amount' => $maturityAmount,
            'maturity_instruction' => $data['maturity_instruction'],
            'status' => 'ACTIVE',
        ]));
    }
}