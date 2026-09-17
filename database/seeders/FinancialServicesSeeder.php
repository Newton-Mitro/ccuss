<?php

namespace Database\Seeders;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinancialServicesSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();

        $branchId = $organization->branches()->oldest('id')->value('id');

        DB::transaction(function () use ($organization, $branchId) {
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

                $debitAccount = $category === 'LOAN'
                    ? '1100'
                    : '2100';
                $creditAccount = $category === 'LOAN'
                    ? '1100'
                    : '2100';

                $debitLedgerAccount = LedgerAccount::query()
                    ->where('organization_id', $organization->id)
                    ->where('code', $debitAccount)
                    ->first();
                $creditLedgerAccount = LedgerAccount::query()
                    ->where('organization_id', $organization->id)
                    ->where('code', $creditAccount)
                    ->first();

                if ($debitLedgerAccount && $creditLedgerAccount) {
                    FinancialProductAccountMapping::query()->firstOrCreate(
                        [
                            'financial_product_id' => $product->id,
                            'transaction_type' => 'DEPOSIT',
                        ],
                        [
                            'debit_account_id' => $debitLedgerAccount->id,
                            'credit_account_id' => $creditLedgerAccount->id,
                            'status' => true,
                        ],
                    );
                }
            }

            $customers = Customer::query()
                ->where('organization_id', $organization->id)
                ->where('type', 'INDIVIDUAL')
                ->orderBy('id')
                ->take(3)
                ->get();

            if ($customers->isEmpty()) {
                $customers = Customer::factory()->count(3)->create([
                    'organization_id' => $organization->id,
                    'type' => 'INDIVIDUAL',
                ]);
            }

            $savingsProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('category', 'SAVINGS')
                ->first();

            foreach ($customers as $index => $customer) {
                $account = FinancialAccount::query()->firstOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_no' => sprintf('SAV-%06d', $customer->id),
                    ],
                    [
                        'branch_id' => $branchId,
                        'financial_product_id' => $savingsProduct?->id,
                        'holder_type' => Customer::class,
                        'holder_id' => $customer->id,
                        'name' => $customer->name,
                        'account_type' => 'SAVINGS',
                        'status' => 'ACTIVE',
                        'balance' => 0,
                        'available_balance' => 0,
                        'interest_accrued' => 0,
                        'opened_at' => now()->subMonths($index + 1)->toDateString(),
                        'metadata' => ['seeded' => true],
                    ],
                );

                FinancialTransaction::query()->firstOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => sprintf('FT-SEED-%03d', $index + 1),
                    ],
                    [
                        'branch_id' => $branchId,
                        'financial_account_id' => $account->id,
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => now()->subDays($index + 1),
                        'amount' => 0,
                        'currency' => 'BDT',
                        'status' => 'PENDING',
                        'reference' => 'SEED-DRAFT',
                        'description' => 'Development transaction draft',
                    ],
                );
            }
        });
    }
}