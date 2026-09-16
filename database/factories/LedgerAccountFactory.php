<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class LedgerAccountFactory extends Factory
{
    protected $model = LedgerAccount::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);

        return [
            'organization_id' => Organization::factory(),
            'account_group_id' => AccountGroup::factory(),
            'parent_id' => null,
            'code' => (string) fake()->unique()->numberBetween(10000, 99999),
            'name' => fake()->unique()->words(2, true),
            'type' => $type,
            'normal_balance' => in_array($type, ['ASSET', 'EXPENSE'], true) ? 'DEBIT' : 'CREDIT',
            'level' => 0,
            'is_control_account' => false,
            'is_reconcilable' => false,
            'is_cash_account' => false,
            'is_system' => false,
            'status' => true,
        ];
    }
}
