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
                'type' => 'asset',
                'is_control_account' => true,
            ]);

            $currentAssets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1100',
                'name' => 'Current Assets',
                'type' => 'asset',
                'parent_id' => $assets->id,
                'is_control_account' => true,
            ]);

            $fixedAssets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1200',
                'name' => 'Fixed Assets',
                'type' => 'asset',
                'parent_id' => $assets->id,
                'is_control_account' => true,
            ]);

            // CASH & BANK
            $cash = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1110',
                'name' => 'Cash & Bank',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1112',
                'name' => 'Cash In Bank',
                'type' => 'asset',
                'parent_id' => $cash->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1113',
                'name' => 'Petty Cash',
                'type' => 'asset',
                'parent_id' => $cash->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1114',
                'name' => 'Cash in Vault',
                'type' => 'asset',
                'parent_id' => $cash->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1115',
                'name' => 'Teller Cash',
                'type' => 'asset',
                'parent_id' => $cash->id,
            ]);

            // RECEIVABLES
            $receivables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1130',
                'name' => 'Receivables',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1131',
                'name' => 'Interest Receivable',
                'type' => 'asset',
                'parent_id' => $receivables->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1132',
                'name' => 'Fee Receivable',
                'type' => 'asset',
                'parent_id' => $receivables->id,
            ]);

            // LOAN PORTFOLIO
            $loanPortfolio = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1140',
                'name' => 'Loan Portfolio',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1141',
                'name' => 'General Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1142',
                'name' => 'Education Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1143',
                'name' => 'Housing Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1144',
                'name' => 'sme Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
            ]);

            // FIXED ASSETS
            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1201',
                'name' => 'Land',
                'type' => 'asset',
                'parent_id' => $fixedAssets->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1202',
                'name' => 'Building',
                'type' => 'asset',
                'parent_id' => $fixedAssets->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1203',
                'name' => 'Office Equipment',
                'type' => 'asset',
                'parent_id' => $fixedAssets->id,
            ]);

            // ----------------------------
            // LIABILITIES (2000)
            // ----------------------------
            $liabilities = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2000',
                'name' => 'Liabilities',
                'type' => 'liability',
                'is_control_account' => true,
            ]);

            $currentLiabilities = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2100',
                'name' => 'Current Liabilities',
                'type' => 'liability',
                'parent_id' => $liabilities->id,
                'is_control_account' => true,
            ]);

            // MEMBER DEPOSITS
            $memberDeposits = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2010',
                'name' => 'Member Deposits',
                'type' => 'liability',
                'parent_id' => $currentLiabilities->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2011',
                'name' => 'Savings Deposit',
                'type' => 'liability',
                'parent_id' => $memberDeposits->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2012',
                'name' => 'Fixed Deposit',
                'type' => 'liability',
                'parent_id' => $memberDeposits->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2013',
                'name' => 'Term Deposit',
                'type' => 'liability',
                'parent_id' => $memberDeposits->id,
            ]);

            // PAYABLES (VENDORS)
            $payables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2110',
                'name' => 'Payables',
                'type' => 'liability',
                'parent_id' => $currentLiabilities->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2111',
                'name' => 'Vendor Payables',
                'type' => 'liability',
                'parent_id' => $payables->id,
            ]);

            // SUSPENSE
            $suspense = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2200',
                'name' => 'Suspense Accounts',
                'type' => 'liability',
                'parent_id' => $liabilities->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2201',
                'name' => 'General Suspense',
                'type' => 'liability',
                'parent_id' => $suspense->id,
            ]);

            // ----------------------------
            // equity (3000)
            // ----------------------------
            $equity = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3000',
                'name' => 'Equity',
                'type' => 'equity',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3010',
                'name' => 'Share Capital',
                'type' => 'equity',
                'parent_id' => $equity->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3020',
                'name' => 'Retained Earnings',
                'type' => 'equity',
                'parent_id' => $equity->id,
            ]);

            // ----------------------------
            // income (4000)
            // ----------------------------
            $income = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4000',
                'name' => 'Income',
                'type' => 'income',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4101',
                'name' => 'Loan Interest Income',
                'type' => 'income',
                'parent_id' => $income->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4102',
                'name' => 'Late Payment Fine',
                'type' => 'income',
                'parent_id' => $income->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4103',
                'name' => 'Loan Insurance Fee',
                'type' => 'income',
                'parent_id' => $income->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4104',
                'name' => 'Insurance Renewal Fee',
                'type' => 'income',
                'parent_id' => $income->id,
            ]);

            // ----------------------------
            // EXPENSES (5000)
            // ----------------------------
            $expenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5000',
                'name' => 'Expenses',
                'type' => 'expense',
                'is_control_account' => true,
            ]);

            // ----------------------------
            // OPERATING EXPENSES (5100)
            // ----------------------------
            $operatingExpenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5100',
                'name' => 'Operating Expenses',
                'type' => 'expense',
                'parent_id' => $expenses->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organization->id,
                    'code' => '5101',
                    'name' => 'Salaries & Wages',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5102',
                    'name' => 'Office Expenses',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5103',
                    'name' => 'Utilities',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5104',
                    'name' => 'Stationery',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5105',
                    'name' => 'Printing & Photocopy',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5106',
                    'name' => 'Office Supplies',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5107',
                    'name' => 'Cleaning Materials',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5108',
                    'name' => 'Pantry / Snacks',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5109',
                    'name' => 'Courier / Delivery',
                    'type' => 'expense',
                    'parent_id' => $operatingExpenses->id,
                ],
            ]);

            // ----------------------------
            // FINANCIAL EXPENSES (5200)
            // ----------------------------
            $financialExpenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5200',
                'name' => 'Financial Expenses',
                'type' => 'expense',
                'parent_id' => $expenses->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organization->id,
                    'code' => '5201',
                    'name' => 'Savings Interest Expense',
                    'type' => 'expense',
                    'parent_id' => $financialExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5202',
                    'name' => 'Fixed Deposit Interest Expense',
                    'type' => 'expense',
                    'parent_id' => $financialExpenses->id,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '5203',
                    'name' => 'Term Deposit Interest Expense',
                    'type' => 'expense',
                    'parent_id' => $financialExpenses->id,
                ],
            ]);

            // ----------------------------
            // PROVISIONS (5300)
            // ----------------------------
            $provisions = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5300',
                'name' => 'Provisions',
                'type' => 'expense',
                'parent_id' => $expenses->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5301',
                'name' => 'Provision For Loan Losses',
                'type' => 'expense',
                'parent_id' => $provisions->id,
            ]);

            $this->command->info('✅ full Banking-Grade COA Seeded Successfully!');
        });
    }
}