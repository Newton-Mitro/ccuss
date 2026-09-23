<?php

namespace Database\Seeders;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\FinancialTransactionEntry;
use App\FinancialServices\Models\FixedDeposit;
use App\FinancialServices\Models\ShareAccount;
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
            $savingsOpeningAmount = 1000;
            $shareOpeningAmount = 5000;
            $legacySavingsBalance = 25000;
            $legacyFixedDepositPrincipal = 100000;

            $products = [
                ['SAV-REG', 'Regular Savings', 'SAVINGS', 'LIABILITY', '3.000000', 'SIMPLE', 'MONTHLY', 100],
                ['SAV-MINOR', 'Minor Savings', 'SAVINGS', 'LIABILITY', '4.000000', 'SIMPLE', 'MONTHLY', 50],
                ['SHR-MEM', 'Member Share Capital', 'SHARE', 'EQUITY', '0.000000', 'NONE', 'NONE', 1000],
                ['FDR-12M', 'Twelve Month Fixed Deposit', 'FIXED_DEPOSIT', 'LIABILITY', '8.500000', 'COMPOUND', 'MATURITY', 10000],
                ['RD-24M', 'Twenty Four Month Recurring Deposit', 'RECURRING_DEPOSIT', 'LIABILITY', '7.000000', 'COMPOUND', 'MONTHLY', 500],
                ['LN-GEN', 'General Loan', 'LOAN', 'ASSET', '12.000000', 'REDUCING_BALANCE', 'MONTHLY', 0],
            ];

            foreach ($products as [$code, $name, $category, $balanceType, $rate, $calculation, $frequency, $minimumOpening]) {
                $product = FinancialProduct::query()->updateOrCreate(
                    ['organization_id' => $organization->id, 'code' => $code],
                    [
                        'name' => $name,
                        'category' => $category,
                        'balance_type' => $balanceType,
                        'interest_rate' => $rate,
                        'interest_calculation' => $calculation,
                        'interest_frequency' => $frequency,
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

                FinancialProductPolicy::query()->updateOrCreate(
                    ['financial_product_id' => $product->id],
                    [
                        'minimum_opening_amount' => $minimumOpening,
                        'minimum_deposit_amount' => $category === 'LOAN' ? null : $minimumOpening,
                        'maximum_loan_amount' => $category === 'LOAN' ? 500000 : null,
                        'loan_to_value_percent' => $category === 'LOAN' ? 80 : null,
                        'eligibility_rules' => [
                            'kyc_level' => $category === 'LOAN' ? 'FULL' : 'BASIC',
                            'organization_customers_allowed' => true,
                        ],
                        'tenure_rules' => $category === 'LOAN' ? ['minimum_months' => 6, 'maximum_months' => 60] : null,
                        'repayment_rules' => $category === 'LOAN' ? ['frequency' => 'MONTHLY', 'allocation' => ['FEE', 'INTEREST', 'PRINCIPAL']] : null,
                        'status' => 'ACTIVE',
                        'version' => '1.0',
                        'effective_from' => now()->toDateString(),
                    ],
                );

                $liabilityAccount = match ($category) {
                    'SAVINGS' => '2100',
                    'FIXED_DEPOSIT' => '2200',
                    'RECURRING_DEPOSIT' => '2300',
                    'SHARE' => '3100',
                    default => '1300',
                };
                $mappingPairs = $category === 'LOAN'
                    ? [
                        ['DISBURSEMENT', '1300', '1100'],
                        ['REPAYMENT', '1100', '1300'],
                        ['INTEREST', '1100', '4100'],
                        ['FEE', '1100', '4200'],
                    ]
                    : [
                        ['DEPOSIT', '1100', $liabilityAccount],
                        ['WITHDRAWAL', $liabilityAccount, '1100'],
                        ['INTEREST', '5200', $liabilityAccount],
                        ['FEE', $liabilityAccount, '4200'],
                    ];

                foreach ($mappingPairs as [$transactionType, $debitCode, $creditCode]) {
                    $debitAccount = LedgerAccount::query()->where('organization_id', $organization->id)->where('code', $debitCode)->first();
                    $creditAccount = LedgerAccount::query()->where('organization_id', $organization->id)->where('code', $creditCode)->first();
                    if ($debitAccount && $creditAccount) {
                        FinancialProductAccountMapping::query()->updateOrCreate(
                            ['financial_product_id' => $product->id, 'transaction_type' => $transactionType],
                            ['debit_account_id' => $debitAccount->id, 'credit_account_id' => $creditAccount->id, 'status' => true],
                        );
                    }
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

            $cashAccount = FinancialAccount::query()->firstOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'CASH-VAULT-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => null,
                    'account_type' => 'CASH',
                    'status' => 'ACTIVE',
                    'balance' => 0,
                    'available_balance' => 0,
                    'opened_at' => now()->subYear()->toDateString(),
                    'metadata' => ['seeded' => true, 'cash_location' => 'Main Vault'],
                ],
            );

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
                        'balance' => $savingsOpeningAmount,
                        'available_balance' => $savingsOpeningAmount,
                        'interest_accrued' => 0,
                        'opened_at' => now()->subMonths($index + 1)->toDateString(),
                        'metadata' => ['seeded' => true],
                    ],
                );

                $transaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => sprintf('FT-SEED-%03d', $index + 1),
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => now()->subDays($index + 1),
                        'amount' => $savingsOpeningAmount,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => 'SEED-OPENING',
                        'description' => 'Seeded member savings opening deposit',
                    ],
                );

                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $transaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => $savingsOpeningAmount, 'balance_after' => ($index + 1) * $savingsOpeningAmount, 'description' => 'Seeded vault cash received'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $transaction->id, 'financial_account_id' => $account->id, 'direction' => 'CREDIT'],
                    ['amount' => $savingsOpeningAmount, 'balance_after' => $savingsOpeningAmount, 'description' => 'Member savings balance'],
                );
                $account->update([
                    'balance' => $savingsOpeningAmount,
                    'available_balance' => $savingsOpeningAmount,
                ]);

                $savingsProduct = FinancialProduct::query()->where('code', 'SAV-REG')->where('organization_id', $organization->id)->firstOrFail();
                $account->update([
                    'opened_at' => now()->subMonths(7)->toDateString(),
                    'last_operated_at' => now()->subDays($index + 1)->toDateString(),
                ]);
                $account->addHolder($customer, 'PRIMARY');
            }

            $seededSavingsCount = $customers->count();
            $cashAccount->update([
                'balance' => $seededSavingsCount * $savingsOpeningAmount,
                'available_balance' => $seededSavingsCount * $savingsOpeningAmount,
            ]);

            $legacyCustomer = Customer::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'customer_no' => 'LEGACY-MEMBER-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'type' => 'INDIVIDUAL',
                    'name' => 'Legacy Migrated Member',
                    'primary_phone' => '+8801700000001',
                    'primary_email' => 'legacy.member@example.test',
                    'identification_type' => 'NATIONAL_IDENTIFICATION_NUMBER',
                    'identification_number' => 'LEGACY-NID-0001',
                    'dob' => '1985-05-20',
                    'gender' => 'OTHER',
                    'status' => 'ACTIVE',
                ],
            );

            $legacySavingsProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'SAV-REG')
                ->firstOrFail();
            $legacySavingsAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'LEGACY-SAV-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $legacySavingsProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $legacyCustomer->id,
                    'name' => $legacyCustomer->name,
                    'account_type' => 'SAVINGS',
                    'status' => 'ACTIVE',
                    'balance' => $legacySavingsBalance,
                    'available_balance' => $legacySavingsBalance,
                    'opened_at' => '2019-04-15',
                    'metadata' => [
                        'seeded' => true,
                        'migration' => [
                            'source_system' => 'legacy_core_banking',
                            'source_account_no' => 'OLD-SAV-88421',
                            'migrated_at' => '2025-07-01',
                            'opening_balance' => $legacySavingsBalance,
                        ],
                    ],
                ],
            );
            $legacySavingsAccount->update([
                'opened_at' => '2019-04-15',
                'last_operated_at' => '2025-06-28',
                'membership_eligible_at' => '2019-10-15',
            ]);
            $legacySavingsAccount->addHolder($legacyCustomer, 'PRIMARY');

            $legacyFixedProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'FDR-12M')
                ->firstOrFail();
            $legacyFixedAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'LEGACY-FDR-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $legacyFixedProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $legacyCustomer->id,
                    'name' => $legacyCustomer->name,
                    'account_type' => 'FIXED_DEPOSIT',
                    'status' => 'ACTIVE',
                    'balance' => $legacyFixedDepositPrincipal,
                    'available_balance' => 0,
                    'opened_at' => '2024-01-01',
                    'metadata' => [
                        'seeded' => true,
                        'migration' => [
                            'source_system' => 'legacy_core_banking',
                            'source_account_no' => 'OLD-FDR-55109',
                            'migrated_at' => '2025-07-01',
                            'opening_balance' => $legacyFixedDepositPrincipal,
                        ],
                    ],
                ],
            );
            $legacyFixedAccount->update([
                'opened_at' => '2024-01-01',
                'last_operated_at' => '2025-06-30',
            ]);
            $legacyFixedAccount->addHolder($legacyCustomer, 'PRIMARY');
            FixedDeposit::query()->updateOrCreate(
                ['financial_account_id' => $legacyFixedAccount->id],
                [
                    'principal_amount' => $legacyFixedDepositPrincipal,
                    'contractual_rate' => 8.5,
                    'term_months' => 12,
                    'started_at' => '2024-01-01',
                    'maturity_date' => '2025-01-01',
                    'maturity_amount' => 108500,
                    'maturity_instruction' => 'RENEW_PRINCIPAL',
                    'status' => 'RENEWED',
                ],
            );

            foreach ([
                [$legacySavingsAccount, $legacySavingsBalance, 'LEGACY-MIGRATION-SAV-0001', 'Migrated legacy savings closing balance'],
                [$legacyFixedAccount, $legacyFixedDepositPrincipal, 'LEGACY-MIGRATION-FDR-0001', 'Migrated legacy fixed deposit principal'],
            ] as [$legacyAccount, $amount, $transactionNo, $description]) {
                $migrationTransaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => $transactionNo,
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'MIGRATION_OPENING_BALANCE',
                        'transaction_date' => '2025-07-01',
                        'amount' => $amount,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => $transactionNo,
                        'description' => $description,
                    ],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $migrationTransaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => $amount, 'balance_after' => $seededSavingsCount * $savingsOpeningAmount + $amount, 'description' => 'Migrated legacy balance offset'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $migrationTransaction->id, 'financial_account_id' => $legacyAccount->id, 'direction' => 'CREDIT'],
                    ['amount' => $amount, 'balance_after' => $amount, 'description' => $description],
                );
            }
            $shareCustomer = $customers->get(1);
            if ($shareCustomer) {
                $shareProduct = FinancialProduct::query()->where('organization_id', $organization->id)->where('category', 'SHARE')->firstOrFail();
                $shareAccount = FinancialAccount::query()->updateOrCreate(
                    ['organization_id' => $organization->id, 'account_no' => sprintf('SHR-%06d', $shareCustomer->id)],
                    ['branch_id' => $branchId, 'financial_product_id' => $shareProduct->id, 'holder_type' => Customer::class, 'holder_id' => $shareCustomer->id, 'name' => $shareCustomer->name, 'account_type' => 'SHARE', 'status' => 'ACTIVE', 'balance' => $shareOpeningAmount, 'available_balance' => $shareOpeningAmount, 'opened_at' => now()->subMonths(6)->toDateString(), 'metadata' => ['seeded' => true]],
                );
                $shareAccount->update([
                    'balance' => $shareOpeningAmount,
                    'available_balance' => $shareOpeningAmount,
                ]);
                $shareAccount->update(['opened_at' => now()->subMonths(6)->toDateString()]);
                $shareAccount->addHolder($shareCustomer, 'PRIMARY');
                ShareAccount::query()->firstOrCreate(['financial_account_id' => $shareAccount->id], ['customer_id' => $shareCustomer->id, 'member_since' => now()->subMonths(6)->toDateString(), 'membership_no' => sprintf('MEM-%05d', $shareCustomer->id), 'membership_status' => 'ACTIVE']);

                $shareTransaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => sprintf('FT-SEED-SHARE-%03d', $shareCustomer->id),
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => now()->subMonths(6),
                        'amount' => $shareOpeningAmount,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => 'SEED-SHARE-OPENING',
                        'description' => 'Seeded member share opening contribution',
                    ],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $shareTransaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => $shareOpeningAmount, 'balance_after' => $seededSavingsCount * $savingsOpeningAmount + $shareOpeningAmount, 'description' => 'Seeded vault cash received for share contribution'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $shareTransaction->id, 'financial_account_id' => $shareAccount->id, 'direction' => 'CREDIT'],
                    ['amount' => $shareOpeningAmount, 'balance_after' => $shareOpeningAmount, 'description' => 'Member share capital opening contribution'],
                );
                $cashAccount->update([
                    'balance' => $seededSavingsCount * $savingsOpeningAmount
                        + $shareOpeningAmount
                        + $legacySavingsBalance
                        + $legacyFixedDepositPrincipal,
                    'available_balance' => $seededSavingsCount * $savingsOpeningAmount
                        + $shareOpeningAmount
                        + $legacySavingsBalance
                        + $legacyFixedDepositPrincipal,
                ]);
            }
        });
    }
}