<?php

namespace Database\Seeders;

use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TreasuryGlMappingSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();

        $mappingRows = [
            ['BANK_TRANSACTION', 'DEFAULT', 'DEPOSIT', '1200', '1210'],
            ['BANK_TRANSACTION', 'DEFAULT', 'WITHDRAWAL', '1210', '1200'],
            ['BANK_TRANSACTION', 'DEFAULT', 'TRANSFER_IN', '1200', '1210'],
            ['BANK_TRANSACTION', 'DEFAULT', 'TRANSFER_OUT', '1210', '1200'],
            ['BANK_TRANSACTION', 'DEFAULT', 'CHARGE', '5100', '1200'],
            ['BANK_TRANSACTION', 'DEFAULT', 'INTEREST', '1200', '4110'],
            ['BANK_TRANSACTION', 'DEFAULT', 'ADJUSTMENT', '1210', '1200'],
            ['PETTY_CASH_TRANSACTION', 'DEFAULT', 'FUNDING', '1130', '1200'],
            ['PETTY_CASH_TRANSACTION', 'DEFAULT', 'REPLENISHMENT', '1130', '1200'],
            ['PETTY_CASH_TRANSACTION', 'DEFAULT', 'EXPENSE', '5100', '1130'],
            ['PETTY_CASH_TRANSACTION', 'DEFAULT', 'RETURN', '1100', '1130'],
            ['PETTY_CASH_TRANSACTION', 'DEFAULT', 'ADJUSTMENT', '5100', '1130'],
        ];

        foreach (['VAULT' => '1110', 'TELLER' => '1120', 'PETTY_CASH' => '1130'] as $sourceCode => $cashAccountCode) {
            $mappingRows[] = ['CASH_LOCATION', $sourceCode, 'DEPOSIT', $cashAccountCode, '1210'];
            $mappingRows[] = ['CASH_LOCATION', $sourceCode, 'WITHDRAWAL', '1210', $cashAccountCode];
            $mappingRows[] = ['CASH_LOCATION', $sourceCode, 'LOAN_DISBURSEMENT', '1300', $cashAccountCode];
            $mappingRows[] = ['CASH_LOCATION', $sourceCode, 'LOAN_REPAYMENT', $cashAccountCode, '1300'];
            $mappingRows[] = ['CASH_LOCATION', $sourceCode, 'FINE_PAYMENT', $cashAccountCode, '1400'];
        }

        foreach ([
            ['DEPOSIT', '1200', '1210'],
            ['WITHDRAWAL', '1210', '1200'],
            ['LOAN_DISBURSEMENT', '1300', '1200'],
            ['LOAN_REPAYMENT', '1200', '1300'],
            ['FINE_PAYMENT', '1200', '1400'],
        ] as [$transactionType, $debitCode, $creditCode]) {
            $mappingRows[] = ['BANK_ACCOUNT', 'DBBL', $transactionType, $debitCode, $creditCode];
        }

        $accountCodes = collect($mappingRows)
            ->flatMap(fn(array $mapping): array => [$mapping[3], $mapping[4]])
            ->unique()
            ->values();

        $ledgerAccounts = LedgerAccount::query()
            ->where('organization_id', $organization->id)
            ->whereIn('code', $accountCodes)
            ->get()
            ->keyBy('code');

        DB::transaction(function () use ($organization, $ledgerAccounts, $mappingRows): void {
            foreach ($mappingRows as [$sourceType, $sourceCode, $transactionType, $debitCode, $creditCode]) {
                $debitAccount = $ledgerAccounts->get($debitCode);
                $creditAccount = $ledgerAccounts->get($creditCode);

                if (!$debitAccount || !$creditAccount) {
                    throw new \RuntimeException("Missing seeded ledger account for treasury mapping {$sourceType}/{$sourceCode}/{$transactionType}.");
                }

                TreasuryGlMapping::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'source_type' => $sourceType,
                        'source_code' => $sourceCode,
                        'transaction_type' => $transactionType,
                    ],
                    [
                        'debit_account_id' => $debitAccount->id,
                        'credit_account_id' => $creditAccount->id,
                        'status' => true,
                    ],
                );
            }
        });

        $this->command?->info('Treasury GL mappings seeded.');
    }
}