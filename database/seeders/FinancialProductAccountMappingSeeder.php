<?php

namespace Database\Seeders;

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

class FinancialProductAccountMappingSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        $catalogs = [
            [DepositProduct::query()->where('organization_id', $organization->id)->where('is_system', true)->get(), false],
            [LoanProduct::query()->where('organization_id', $organization->id)->where('is_system', true)->get(), true],
        ];

        foreach ($catalogs as [$products, $isLoan]) {
            foreach ($products as $product) {
                $liabilityAccount = match ($product->category) {
                    'SAVINGS' => '2100',
                    'FIXED_DEPOSIT' => '2200',
                    'RECURRING_DEPOSIT' => '2300',
                    'SHARE' => '3100',
                    default => '1300',
                };

                $mappingPairs = $isLoan
                    ? [
                        ['DISBURSEMENT', '1300', '1120'],
                        ['REPAYMENT', '1120', '1300'],
                        ['INTEREST', '1120', '4100'],
                        ['FEE', '1120', '4200'],
                    ]
                    : [
                        ['DEPOSIT', '1120', $liabilityAccount],
                        ['WITHDRAWAL', $liabilityAccount, '1120'],
                        ['INTEREST', '5200', $liabilityAccount],
                        ['FEE', $liabilityAccount, '4200'],
                        ['MIGRATION_OPENING_BALANCE', '1120', $liabilityAccount],
                    ];

                foreach ($mappingPairs as [$transactionType, $debitCode, $creditCode]) {
                    $debitAccount = LedgerAccount::query()
                        ->where('organization_id', $organization->id)
                        ->where('code', $debitCode)
                        ->first();
                    $creditAccount = LedgerAccount::query()
                        ->where('organization_id', $organization->id)
                        ->where('code', $creditCode)
                        ->first();

                    if (!$debitAccount || !$creditAccount) {
                        continue;
                    }

                    $product->accountMappings()->updateOrCreate(
                        ['transaction_type' => $transactionType],
                        [
                            'debit_account_id' => $debitAccount->id,
                            'credit_account_id' => $creditAccount->id,
                            'status' => true,
                        ],
                    );
                }
            }
        }

        $this->command?->info('Financial product account mappings seeded.');
    }
}