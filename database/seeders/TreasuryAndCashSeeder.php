<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
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
                    'balance' => 100000,
                    'available_balance' => 100000,
                    'opened_at' => now()->subYear()->toDateString(),
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
                    'opened_at' => now()->subYear()->toDateString(),
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
                    'opened_at' => now()->subYear()->toDateString(),
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
                    'opened_at' => now()->subYear()->toDateString(),
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
        });

        $this->command?->info('Treasury and cash data seeded.');
    }
}
