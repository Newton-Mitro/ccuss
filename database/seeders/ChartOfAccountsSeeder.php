<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\FinanceAndAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;

class ChartOfAccountsSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {

            $organization = Organization::first() ?? Organization::factory()->create();

            // ----------------------------
            // ASSETS
            // ----------------------------
            $assets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1000',
                'name' => 'Assets',
                'type' => 'ASSET',
                'is_control_account' => true,
            ]);

            $currentAssets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1100',
                'name' => 'Current Assets',
                'type' => 'ASSET',
                'parent_id' => $assets->id,
                'is_control_account' => true,
            ]);

            $fixedAssets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1200',
                'name' => 'Fixed Assets',
                'type' => 'ASSET',
                'parent_id' => $assets->id,
                'is_control_account' => true,
            ]);

            // CASH & BANK
            $cash = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1110',
                'name' => 'Cash & Bank',
                'type' => 'ASSET',
                'parent_id' => $currentAssets->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1112',
                'name' => 'Cash In Bank',
                'type' => 'ASSET',
                'parent_id' => $cash->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1113',
                'name' => 'Petty Cash',
                'type' => 'ASSET',
                'parent_id' => $cash->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1114',
                'name' => 'Cash in Vault',
                'type' => 'ASSET',
                'parent_id' => $cash->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1115',
                'name' => 'Teller Cash',
                'type' => 'ASSET',
                'parent_id' => $cash->id,
            ]);

            // RECEIVABLES
            $receivables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1130',
                'name' => 'Receivables',
                'type' => 'ASSET',
                'parent_id' => $currentAssets->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1131',
                'name' => 'Interest Receivable',
                'type' => 'ASSET',
                'parent_id' => $receivables->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1132',
                'name' => 'Fee Receivable',
                'type' => 'ASSET',
                'parent_id' => $receivables->id,
            ]);

            // LOAN PORTFOLIO
            $loanPortfolio = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1140',
                'name' => 'Loan Portfolio',
                'type' => 'ASSET',
                'parent_id' => $currentAssets->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1141',
                'name' => 'General Loan',
                'type' => 'ASSET',
                'parent_id' => $loanPortfolio->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1142',
                'name' => 'Education Loan',
                'type' => 'ASSET',
                'parent_id' => $loanPortfolio->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1143',
                'name' => 'Housing Loan',
                'type' => 'ASSET',
                'parent_id' => $loanPortfolio->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1144',
                'name' => 'SME Loan',
                'type' => 'ASSET',
                'parent_id' => $loanPortfolio->id,
            ]);

            // FIXED ASSETS
            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1201',
                'name' => 'Land',
                'type' => 'ASSET',
                'parent_id' => $fixedAssets->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1202',
                'name' => 'Building',
                'type' => 'ASSET',
                'parent_id' => $fixedAssets->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1203',
                'name' => 'Office Equipment',
                'type' => 'ASSET',
                'parent_id' => $fixedAssets->id,
            ]);

            // ----------------------------
            // LIABILITIES (2000)
            // ----------------------------
            $liabilities = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2000',
                'name' => 'Liabilities',
                'type' => 'LIABILITY',
                'is_control_account' => true,
            ]);

            $currentLiabilities = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2100',
                'name' => 'Current Liabilities',
                'type' => 'LIABILITY',
                'parent_id' => $liabilities->id,
                'is_control_account' => true,
            ]);

            // MEMBER DEPOSITS
            $memberDeposits = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2010',
                'name' => 'Member Deposits',
                'type' => 'LIABILITY',
                'parent_id' => $currentLiabilities->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2011',
                'name' => 'Savings Deposit',
                'type' => 'LIABILITY',
                'parent_id' => $memberDeposits->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2012',
                'name' => 'Fixed Deposit',
                'type' => 'LIABILITY',
                'parent_id' => $memberDeposits->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2013',
                'name' => 'Term Deposit',
                'type' => 'LIABILITY',
                'parent_id' => $memberDeposits->id,
            ]);

            // PAYABLES (VENDORS)
            $payables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2110',
                'name' => 'Payables',
                'type' => 'LIABILITY',
                'parent_id' => $currentLiabilities->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2111',
                'name' => 'Vendor Payables',
                'type' => 'LIABILITY',
                'parent_id' => $payables->id,
            ]);

            // SUSPENSE
            $suspense = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2200',
                'name' => 'Suspense Accounts',
                'type' => 'LIABILITY',
                'parent_id' => $liabilities->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2201',
                'name' => 'General Suspense',
                'type' => 'LIABILITY',
                'parent_id' => $suspense->id,
            ]);

            // ----------------------------
            // EQUITY (3000)
            // ----------------------------
            $equity = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3000',
                'name' => 'Equity',
                'type' => 'EQUITY',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3010',
                'name' => 'Share Capital',
                'type' => 'EQUITY',
                'parent_id' => $equity->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3020',
                'name' => 'Retained Earnings',
                'type' => 'EQUITY',
                'parent_id' => $equity->id,
            ]);

            // ----------------------------
            // INCOME (4000)
            // ----------------------------
            $income = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4000',
                'name' => 'Income',
                'type' => 'INCOME',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4101',
                'name' => 'Loan Interest Income',
                'type' => 'INCOME',
                'parent_id' => $income->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4102',
                'name' => 'Late Payment Fine',
                'type' => 'INCOME',
                'parent_id' => $income->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4103',
                'name' => 'Loan Insurance Fee',
                'type' => 'INCOME',
                'parent_id' => $income->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4104',
                'name' => 'Insurance Renewal Fee',
                'type' => 'INCOME',
                'parent_id' => $income->id,
            ]);

            // ----------------------------
            // EXPENSES (5000)
            // ----------------------------
            $expenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5000',
                'name' => 'Expenses',
                'type' => 'EXPENSE',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5101',
                'name' => 'Salaries & Wages',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5102',
                'name' => 'Office Expenses',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5103',
                'name' => 'Utilities',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5201',
                'name' => 'Savings Interest Expense',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5202',
                'name' => 'Fixed Deposit Interest Expense',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5203',
                'name' => 'Term Deposit Interest Expense',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5300',
                'name' => 'Provision For Loan Losses',
                'type' => 'EXPENSE',
                'parent_id' => $expenses->id,
            ]);

            $this->command->info('✅ full Banking-Grade COA Seeded Successfully!');
        });
    }
}