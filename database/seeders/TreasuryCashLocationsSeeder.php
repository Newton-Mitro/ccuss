<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\CashDenomination;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\Vault;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TreasuryCashLocationsSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');
        $user = User::query()->where('email', 'super.admin@email.com')->firstOrFail();
        $secondTellerUser = User::query()->where('email', 'employee@email.com')->firstOrFail();

        $accounts = FinancialAccount::query()
            ->where('organization_id', $organization->id)
            ->whereIn('account_no', [
                'CASH-VAULT-001',
                'CASH-VAULT-002',
                'CASH-TELLER-001',
                'CASH-TELLER-002',
                'CASH-PETTY-001',
            ])
            ->get()
            ->keyBy('account_no');

        DB::transaction(function () use ($organization, $branchId, $user, $secondTellerUser, $accounts): void {
            CashDenomination::seedBangladeshPreset($organization->id);

            $vaultLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'VAULT-MAIN',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $accounts['CASH-VAULT-001']->id,
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

            $secondVaultLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'VAULT-002',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $accounts['CASH-VAULT-002']->id,
                    'name' => 'Secondary Vault',
                    'type' => 'VAULT',
                    'is_active' => true,
                ],
            );

            Vault::query()->updateOrCreate(
                ['cash_location_id' => $secondVaultLocation->id],
                [
                    'code' => 'VAULT-002',
                    'name' => 'Secondary Branch Vault',
                    'status' => 'ACTIVE',
                    'maximum_balance' => 500000,
                ],
            );

            $tellerLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'TELLER-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $accounts['CASH-TELLER-001']->id,
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

            $secondTellerLocation = CashLocation::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'TELLER-002',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_account_id' => $accounts['CASH-TELLER-002']->id,
                    'name' => 'Secondary Teller',
                    'type' => 'TELLER',
                    'is_active' => true,
                ],
            );

            Teller::query()->updateOrCreate(
                ['cash_location_id' => $secondTellerLocation->id],
                [
                    'user_id' => $secondTellerUser->id,
                    'code' => 'TELLER-002',
                    'name' => 'Secondary Teller',
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
                    'financial_account_id' => $accounts['CASH-PETTY-001']->id,
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
                    'current_balance' => 0,
                    'method' => 'IMPREST',
                    'status' => 'ACTIVE',
                ],
            );
        });

        $this->command?->info('Treasury cash locations seeded.');
    }
}