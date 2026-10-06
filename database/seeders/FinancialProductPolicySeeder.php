<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

class FinancialProductPolicySeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        $products = FinancialProduct::query()
            ->where('organization_id', $organization->id)
            ->where('is_system', true)
            ->get();

        foreach ($products as $product) {
            $isLoan = $product->category === 'LOAN';
            $minimumOpeningAmount = (float) ($product->settings['minimum_opening_amount'] ?? 0);

            FinancialProductPolicy::query()->updateOrCreate(
                ['financial_product_id' => $product->id],
                [
                    'minimum_opening_amount' => $minimumOpeningAmount,
                    'minimum_deposit_amount' => $isLoan ? null : $minimumOpeningAmount,
                    'maximum_loan_amount' => $isLoan ? 0 : null,
                    'loan_to_value_percent' => $isLoan ? 0 : null,
                    'eligibility_rules' => [
                        'kyc_level' => $isLoan ? 'FULL' : 'BASIC',
                        'organization_customers_allowed' => true,
                    ],
                    'tenure_rules' => $isLoan
                        ? ['minimum_months' => 6, 'maximum_months' => 60]
                        : null,
                    'repayment_rules' => $isLoan
                        ? [
                            'frequency' => 'MONTHLY',
                            'allocation' => ['FEE', 'INTEREST', 'PRINCIPAL'],
                        ]
                        : null,
                    'status' => 'ACTIVE',
                    'version' => '1.0',
                    'effective_from' => '2025-07-01',
                ],
            );
        }

        $this->command?->info('Financial product policies seeded.');
    }
}