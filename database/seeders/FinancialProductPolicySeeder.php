<?php

namespace Database\Seeders;

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\DepositPolicy;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Models\LoanPolicy;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

class FinancialProductPolicySeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        foreach (DepositProduct::query()->where('organization_id', $organization->id)->where('is_system', true)->get() as $product) {
            $minimumOpeningAmount = (float) ($product->settings['minimum_opening_amount'] ?? 0);
            $product->policy()->updateOrCreate([], [
                'minimum_opening_amount' => $minimumOpeningAmount,
                'minimum_deposit_amount' => $minimumOpeningAmount,
                'eligibility_rules' => ['kyc_level' => 'BASIC', 'organization_customers_allowed' => true],
                'status' => 'ACTIVE',
                'version' => '1.0',
                'effective_from' => '2025-07-01',
            ]);
        }

        foreach (LoanProduct::query()->where('organization_id', $organization->id)->where('is_system', true)->get() as $product) {
            $product->policy()->updateOrCreate([], [
                'maximum_loan_amount' => 0,
                'loan_to_value_percent' => 0,
                'eligibility_rules' => ['kyc_level' => 'FULL', 'organization_customers_allowed' => true],
                'repayment_rules' => ['frequency' => 'MONTHLY', 'allocation' => ['FEE', 'INTEREST', 'PRINCIPAL']],
                'status' => 'ACTIVE',
                'version' => '1.0',
                'effective_from' => '2025-07-01',
            ]);
        }

        $this->command?->info('Financial product policies seeded.');
    }
}