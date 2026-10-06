<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinancialProductCatalogSeeder extends Seeder
{
    private const ORGANIZATION_CODE = 'ORG-001';
    private const EFFECTIVE_DATE = '2025-07-01';

    public function run(): void
    {
        $organization = Organization::query()
            ->where('code', self::ORGANIZATION_CODE)
            ->firstOrFail();

        $products = [
            ['SAV-REG', 'Regular Savings', 'SAVINGS', 'LIABILITY', '3.000000', 'SIMPLE', 'MONTHLY', 0],
            ['SHR-MEM', 'Member Share Capital', 'SHARE', 'EQUITY', '0.000000', 'NONE', 'NONE', 0],
            ['FDR-12M', 'Twelve Month Fixed Deposit', 'FIXED_DEPOSIT', 'LIABILITY', '8.500000', 'COMPOUND', 'MATURITY', 0],
            ['RD-24M', 'Twenty Four Month Recurring Deposit', 'RECURRING_DEPOSIT', 'LIABILITY', '7.000000', 'COMPOUND', 'MONTHLY', 0],
            ['LN-GEN', 'General Loan', 'LOAN', 'ASSET', '12.000000', 'REDUCING_BALANCE', 'MONTHLY', 0],
        ];

        DB::transaction(function () use ($organization, $products): void {
            foreach ($products as [$code, $name, $category, $balanceType, $rate, $calculation, $frequency, $minimumOpening]) {
                $product = FinancialProduct::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $code,
                    ],
                    [
                        'name' => $name,
                        'category' => $category,
                        'balance_type' => $balanceType,
                        'settings' => [
                            'credit_union' => true,
                            'requires_kyc' => true,
                            'minimum_opening_amount' => $minimumOpening,
                            'joint_holders_allowed' => in_array($category, ['SAVINGS', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true),
                        ],
                        'is_system' => true,
                        'status' => true,
                    ],
                );

                $termValue = match ($category) {
                    'FIXED_DEPOSIT' => 12,
                    'RECURRING_DEPOSIT' => 24,
                    'LOAN' => 12,
                    default => 1,
                };

                DB::table('financial_product_terms')->updateOrInsert(
                    [
                        'financial_product_id' => $product->id,
                        'code' => 'BASE',
                    ],
                    [
                        'name' => 'Base term',
                        'tenure_value' => $termValue,
                        'tenure_unit' => 'MONTH',
                        'interest_rate' => $rate,
                        'interest_calculation' => $calculation,
                        'interest_frequency' => $frequency,
                        'minimum_amount' => $minimumOpening ?: null,
                        'maximum_amount' => null,
                        'rules' => json_encode([]),
                        'status' => true,
                        'effective_from' => self::EFFECTIVE_DATE,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }
        });

        $this->command?->info('Financial product catalog seeded.');
    }
}