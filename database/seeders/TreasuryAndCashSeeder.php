<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialAccount;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\CashDenomination;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\Vault;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TreasuryAndCashSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');
        $user = User::query()->where('email', 'super.admin@email.com')->firstOrFail();

        DB::transaction(function () use ($organization, $branchId, $user): void {
            CashDenomination::seedBangladeshPreset($organization->id);

            $vaultBalance = (float) DB::table('financial_transaction_entries as entries')
                ->join('financial_transactions as transactions', 'transactions.id', '=', 'entries.financial_transaction_id')
                ->where('transactions.organization_id', $organization->id)
                ->where('transactions.status', 'POSTED')
                ->where('entries.financial_account_id', function ($query) use ($organization): void {
                    $query->select('id')
                        ->from('financial_accounts')
                        ->where('organization_id', $organization->id)
                        ->where('account_no', 'CASH-VAULT-001')
                        ->limit(1);
                })
                ->selectRaw("COALESCE(SUM(CASE WHEN entries.direction = 'DEBIT' THEN entries.amount ELSE -entries.amount END), 0) as balance")
                ->value('balance');

            $vaultAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'CASH-VAULT-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => null,
                    'name' => 'Main Vault Cash Account',
                    'account_type' => 'CASH',
                    'status' => 'ACTIVE',
                    'balance' => $vaultBalance,
                    'available_balance' => $vaultBalance,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true, 'cash_location' => 'Main Vault'],
                ],
            );

            $tellerAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'CASH-TELLER-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => null,
                    'name' => 'Main Teller Cash Account',
                    'account_type' => 'CASH',
                    'status' => 'ACTIVE',
                    'balance' => 25000,
                    'available_balance' => 25000,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true, 'cash_location' => 'Main Teller'],
                ],
            );

            $pettyCashAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'CASH-PETTY-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => null,
                    'name' => 'Operations Petty Cash Account',
                    'account_type' => 'CASH',
                    'status' => 'ACTIVE',
                    'balance' => 5000,
                    'available_balance' => 5000,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true, 'cash_location' => 'Operations Petty Cash'],
                ],
            );

            $bank = Bank::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'DBBL',
                ],
                [
                    'name' => 'Dutch-Bangla Bank PLC',
                    'short_name' => 'DBBL',
                    'status' => true,
                ],
            );

            $bankFinancialAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'BANK-DBBL-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => null,
                    'name' => 'Dutch-Bangla Bank Operating Account',
                    'account_type' => 'BANK',
                    'status' => 'ACTIVE',
                    'balance' => 250000,
                    'available_balance' => 250000,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true, 'bank_code' => $bank->code],
                ],
            );

            BankAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_number' => 'DBBL-CCUSS-001',
                ],
                [
                    'branch_id' => $branchId,
                    'bank_id' => $bank->id,
                    'financial_account_id' => $bankFinancialAccount->id,
                    'account_name' => 'CCUSS Operating Account',
                    'routing_number' => '090274639',
                    'account_type' => 'CURRENT',
                    'opening_balance' => 250000,
                    'is_reconcilable' => true,
                    'status' => 'ACTIVE',
                ],
            );

            $vaultLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'VAULT-MAIN',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $vaultAccount->id,
                    'name' => 'Main Vault',
                    'type' => 'VAULT',
                    'is_active' => true,
                ],
            );

            Vault::query()->updateOrCreate(
                ['cash_location_id' => $vaultLocation->id],
                [
                    'code' => 'VAULT-001',
                    'name' => 'Main Branch Vault',
                    'status' => 'ACTIVE',
                    'maximum_balance' => 1000000,
                ],
            );

            $tellerLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'TELLER-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $tellerAccount->id,
                    'name' => 'Main Teller',
                    'type' => 'TELLER',
                    'is_active' => true,
                ],
            );

            Teller::query()->updateOrCreate(
                ['cash_location_id' => $tellerLocation->id],
                [
                    'user_id' => $user->id,
                    'code' => 'TELLER-001',
                    'name' => 'Main Teller',
                    'status' => 'ACTIVE',
                    'maximum_cash' => 100000,
                ],
            );

            $pettyCashLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'PETTY-OPS-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $pettyCashAccount->id,
                    'name' => 'Operations Petty Cash',
                    'type' => 'PETTY_CASH',
                    'is_active' => true,
                ],
            );

            PettyCashFund::query()->updateOrCreate(
                ['cash_location_id' => $pettyCashLocation->id],
                [
                    'custodian_id' => $user->id,
                    'code' => 'PETTY-001',
                    'name' => 'Operations Petty Cash Fund',
                    'fund_limit' => 10000,
                    'current_balance' => 5000,
                    'method' => 'IMPREST',
                    'status' => 'ACTIVE',
                ],
            );

            $this->seedGlMappings($organization);
        });

        $this->command?->info('Treasury and cash data seeded.');
    }

    private function seedGlMappings(Organization $organization): void
    {
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
    }
}
