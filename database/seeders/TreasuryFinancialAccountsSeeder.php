<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TreasuryFinancialAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');

        DB::transaction(function () use ($organization, $branchId): void {
            foreach ([
                ['CASH-VAULT-001', 'Main Vault Cash Account', 'CASH', 'Main Vault'],
                ['CASH-TELLER-001', 'Main Teller Cash Account', 'CASH', 'Main Teller'],
                ['CASH-PETTY-001', 'Operations Petty Cash Account', 'CASH', 'Operations Petty Cash'],
            ] as [$accountNo, $name, $accountType, $cashLocation]) {
                FinancialAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_no' => $accountNo,
                    ],
                    [
                        'branch_id' => $branchId,
                        'product_type' => null,
                        'product_id' => null,
                        'name' => $name,
                        'account_type' => $accountType,
                        'status' => 'ACTIVE',
                        'balance' => 0,
                        'available_balance' => 0,
                        'opened_at' => '2025-07-01',
                        'metadata' => ['seeded' => true, 'cash_location' => $cashLocation],
                    ],
                );
            }

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
                    'product_type' => null,
                    'product_id' => null,
                    'name' => 'Dutch-Bangla Bank Operating Account',
                    'account_type' => 'BANK',
                    'status' => 'ACTIVE',
                    'balance' => 0,
                    'available_balance' => 0,
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
                    'opening_balance' => 0,
                    'is_reconcilable' => true,
                    'status' => 'ACTIVE',
                ],
            );
        });

        $this->command?->info('Treasury financial accounts seeded.');
    }
}