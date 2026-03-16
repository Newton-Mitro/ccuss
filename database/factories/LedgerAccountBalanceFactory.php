<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\LedgerAccount;
use App\FinanceAndAccounting\Models\LedgerAccountBalance;
use App\FinanceAndAccounting\Models\AccountingPeriod;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class LedgerAccountBalanceFactory extends Factory
{
    protected $model = LedgerAccountBalance::class;

    public function definition(): array
    {
        // Generate an organization first
        $organization = Organization::factory()->create();

        // Ledger account and period within the same organization
        $ledgerAccount = LedgerAccount::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $period = AccountingPeriod::factory()->create([
            'organization_id' => $organization->id,
        ]);

        // Generate balances
        $opening = $this->faker->randomFloat(2, 0, 5000);
        $debit = $this->faker->randomFloat(2, 0, 2000);
        $credit = $this->faker->randomFloat(2, 0, 2000);
        $closing = $opening + $debit - $credit;

        return [
            'organization_id' => $organization->id,
            'ledger_account_id' => $ledgerAccount->id,
            'accounting_period_id' => $period->id,
            'opening_balance' => $opening,
            'debit_total' => $debit,
            'credit_total' => $credit,
            'closing_balance' => $closing,
        ];
    }
}