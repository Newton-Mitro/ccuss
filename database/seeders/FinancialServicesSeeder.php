<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinancialServicesSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG001')->firstOrFail();

        DB::transaction(function () use ($organization) {
            $products = [
                ['SAV-REG', 'Regular Savings', 'SAVINGS', 'LIABILITY', '3.000000', 'SIMPLE', 'MONTHLY'],
                ['SHR-GEN', 'General Shares', 'SHARE', 'EQUITY', '0.000000', 'NONE', 'NONE'],
                ['FDR-12M', 'Twelve Month Fixed Deposit', 'FIXED_DEPOSIT', 'LIABILITY', '8.500000', 'COMPOUND', 'MATURITY'],
                ['LN-GEN', 'General Loan', 'LOAN', 'ASSET', '12.000000', 'REDUCING_BALANCE', 'MONTHLY'],
            ];

            foreach ($products as [$code, $name, $category, $balanceType, $rate, $calculation, $frequency]) {
                $product = FinancialProduct::query()->firstOrCreate(
                    ['organization_id' => $organization->id, 'code' => $code],
                    [
                        'name' => $name,
                        'category' => $category,
                        'balance_type' => $balanceType,
                        'interest_rate' => $rate,
                        'interest_calculation' => $calculation,
                        'interest_frequency' => $frequency,
                        'is_system' => true,
                        'status' => true,
                    ],
                );

                FinancialProductPolicy::query()->firstOrCreate(
                    ['financial_product_id' => $product->id],
                    [
                        'minimum_opening_amount' => $category === 'LOAN' ? 0 : 100,
                        'minimum_deposit_amount' => $category === 'LOAN' ? null : 100,
                        'status' => 'ACTIVE',
                        'version' => '1.0',
                        'effective_from' => now()->toDateString(),
                    ],
                );
            }
        });
    }
}