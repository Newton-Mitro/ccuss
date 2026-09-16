<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\BudgetEntry;
use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetEntryFactory extends Factory
{
    protected $model = BudgetEntry::class;

    public function definition(): array
    {
        return [
            'organization_id' => fn() => Budget::factory()->create()->organization_id,
            'budget_id' => Budget::factory(),
            'account_id' => LedgerAccount::factory(),
            'cost_center_id' => null,
            'fiscal_period_id' => null,
            'amount' => fake()->randomFloat(4, 100, 10000),
        ];
    }
}
