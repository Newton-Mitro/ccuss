<?php

namespace Database\Seeders;

use App\FinancialServices\Models\AccountDefaultRule;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

class AccountDefaultRulesSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            [
                'account_type' => 'SAVINGS',
                'name' => 'Default savings account rule',
                'grace_days' => 0,
            ],
            [
                'account_type' => 'SHARE',
                'name' => 'Default share account rule',
                'grace_days' => 0,
            ],
            [
                'account_type' => 'LOAN',
                'name' => 'Default loan installment rule',
                'grace_days' => 0,
            ],
            [
                'account_type' => 'RECURRING_DEPOSIT',
                'name' => 'Default recurring deposit installment rule',
                'grace_days' => 7,
            ],
        ];

        Organization::query()->each(function (Organization $organization) use ($rules): void {
            foreach ($rules as $rule) {
                AccountDefaultRule::query()->firstOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_type' => $rule['account_type'],
                        'product_type' => null,
                        'product_id' => null,
                        'name' => $rule['name'],
                    ],
                    [
                        'grace_days' => $rule['grace_days'],
                        'fine_calculation' => 'FIXED',
                        'fine_amount' => 0,
                        'fine_rate' => 0,
                        'maximum_fine' => null,
                        'extends_maturity' => false,
                        'maturity_extension_days' => 0,
                        'is_active' => false,
                        'effective_from' => null,
                        'effective_to' => null,
                    ],
                );
            }
        });
    }
}
