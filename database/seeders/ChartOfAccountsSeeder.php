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
            // ASSETS (1000)
            // ----------------------------
            $assets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1000',
                'name' => 'Assets',
                'type' => 'asset',
                'description' => 'All organizational assets',
            ]);

            $currentAssets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1100',
                'name' => 'Current Assets',
                'type' => 'asset',
                'parent_id' => $assets->id,
                'description' => 'Short-term assets convertible to cash within a year',
            ]);

            $fixedAssets = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1200',
                'name' => 'Fixed Assets',
                'type' => 'asset',
                'parent_id' => $assets->id,
                'description' => 'Long-term tangible assets for operational use',
            ]);

            // CASH & BANK
            $cash = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1110',
                'name' => 'Cash & Bank',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'description' => 'Cash in hand and bank balances',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1112',
                'name' => 'Cash In Bank',
                'type' => 'asset',
                'parent_id' => $cash->id,
                'description' => 'Cash held in bank accounts',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1113',
                'name' => 'Petty Cash',
                'type' => 'asset',
                'parent_id' => $cash->id,
                'description' => 'Small cash for daily operational expenses',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1114',
                'name' => 'Cash in Vault',
                'type' => 'asset',
                'parent_id' => $cash->id,
                'description' => 'Cash stored securely in vault',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1115',
                'name' => 'Teller Cash',
                'type' => 'asset',
                'parent_id' => $cash->id,
                'description' => 'Cash held by teller for transactions',
                'is_control_account' => true,
            ]);

            // ----------------------------
            // EMPLOYEE ADVANCES (1300) ✅ CRITICAL
            // ----------------------------
            $employeeAdvances = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1300',
                'name' => 'Employee Advances',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'description' => 'Advances given to employees',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '13001',
                'name' => 'Advance Petty Cash',
                'type' => 'asset',
                'parent_id' => $employeeAdvances->id,
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '13002',
                'name' => 'Advance Salary',
                'type' => 'asset',
                'parent_id' => $employeeAdvances->id,
                'is_control_account' => true,
            ]);

            // RECEIVABLES
            $receivables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1130',
                'name' => 'Accounts Receivable',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'description' => 'Amounts due from customers',
            ]);

            // Loan Receivables
            $loanReceivables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1131',
                'name' => 'Loan Receivables',
                'type' => 'asset',
                'parent_id' => $receivables->id,
                'description' => 'Outstanding loan amounts from borrowers',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '11311',
                'name' => 'Interest Receivable',
                'type' => 'asset',
                'parent_id' => $loanReceivables->id,
                'description' => 'Accrued interest on loans',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '11312',
                'name' => 'Loan Fee Receivable',
                'type' => 'asset',
                'parent_id' => $loanReceivables->id,
                'description' => 'Fees charged on loans not yet collected',
                'is_control_account' => true,
            ]);

            // Service Receivables
            $serviceReceivables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1132',
                'name' => 'Service Receivables',
                'type' => 'asset',
                'parent_id' => $receivables->id,
                'description' => 'Amounts receivable for software/services provided',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '11321',
                'name' => 'Installation Receivable',
                'type' => 'asset',
                'parent_id' => $serviceReceivables->id,
                'description' => 'Receivable for installation services',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '11322',
                'name' => 'Migration Receivable',
                'type' => 'asset',
                'parent_id' => $serviceReceivables->id,
                'description' => 'Receivable for migration services',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '11323',
                'name' => 'Subscription Receivable',
                'type' => 'asset',
                'parent_id' => $serviceReceivables->id,
                'description' => 'Receivable from subscription services',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '11324',
                'name' => 'Support & Maintenance Receivable',
                'type' => 'asset',
                'parent_id' => $serviceReceivables->id,
                'description' => 'Receivable for support and maintenance services',
                'is_control_account' => true,
            ]);

            // Other Receivables
            $otherReceivables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1133',
                'name' => 'Other Receivables',
                'type' => 'asset',
                'parent_id' => $receivables->id,
                'description' => 'Miscellaneous receivables',
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organization->id,
                    'code' => '1134',
                    'name' => 'Service Fees Receivable (One-Off)',
                    'type' => 'asset',
                    'parent_id' => $otherReceivables->id,
                    'description' => 'One-time service fees receivable',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '1135',
                    'name' => 'Receivable from Non-Asset Sales',
                    'type' => 'asset',
                    'parent_id' => $otherReceivables->id,
                    'description' => 'Receivables from sales of non-assets',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '1136',
                    'name' => 'Miscellaneous Receivables',
                    'type' => 'asset',
                    'parent_id' => $otherReceivables->id,
                    'description' => 'Other miscellaneous receivables',
                    'is_control_account' => true,
                ],
            ]);

            // Loan Portfolio
            $loanPortfolio = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1140',
                'name' => 'Loan Portfolio',
                'type' => 'asset',
                'parent_id' => $currentAssets->id,
                'description' => 'All loans provided to borrowers',
            ]);

            LedgerAccount::create(
                [
                    'organization_id' => $organization->id,
                    'code' => '1141',
                    'name' => 'General Loan',
                    'type' => 'asset',
                    'parent_id' => $loanPortfolio->id,
                    'description' => 'General purpose loans',
                    'is_control_account' => true,
                ],
            );

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1142',
                'name' => 'Education Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
                'description' => 'Loans provided for educational purposes',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1143',
                'name' => 'Housing Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
                'description' => 'Loans provided for housing purposes',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1144',
                'name' => 'SME Loan',
                'type' => 'asset',
                'parent_id' => $loanPortfolio->id,
                'description' => 'Loans for small and medium enterprises',
                'is_control_account' => true,
            ]);

            // Fixed Assets
            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1201',
                'name' => 'Land',
                'type' => 'asset',
                'parent_id' => $fixedAssets->id,
                'description' => 'Land owned by the organization',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1202',
                'name' => 'Building',
                'type' => 'asset',
                'parent_id' => $fixedAssets->id,
                'description' => 'Buildings owned by the organization',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '1203',
                'name' => 'Office Equipment',
                'type' => 'asset',
                'parent_id' => $fixedAssets->id,
                'description' => 'Office furniture and equipment',
            ]);

            // ----------------------------
            // LIABILITIES (2000)
            // ----------------------------
            $liabilities = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2000',
                'name' => 'Liabilities',
                'type' => 'liability',
                'description' => 'All organizational obligations',
            ]);

            // ----------------------------
            // CURRENT LIABILITIES (2100)
            // ----------------------------
            $currentLiabilities = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2100',
                'name' => 'Current Liabilities',
                'type' => 'liability',
                'parent_id' => $liabilities->id,
                'description' => 'Obligations due within one year',
            ]);

            // ----------------------------
            // MEMBER DEPOSITS (2010)
            // ----------------------------
            $memberDeposits = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2010',
                'name' => 'Member Deposits',
                'type' => 'liability',
                'parent_id' => $currentLiabilities->id,
                'description' => 'Deposits made by members/customers',
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organization->id,
                    'code' => '2011',
                    'name' => 'Savings Deposit',
                    'type' => 'liability',
                    'parent_id' => $memberDeposits->id,
                    'description' => 'Deposits in member savings accounts',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2012',
                    'name' => 'Fixed Deposit',
                    'type' => 'liability',
                    'parent_id' => $memberDeposits->id,
                    'description' => 'Time-bound fixed deposits from members',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2013',
                    'name' => 'Term Deposit',
                    'type' => 'liability',
                    'parent_id' => $memberDeposits->id,
                    'description' => 'Deposits held for a specific term duration',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2014',
                    'name' => 'Interest Payable',
                    'type' => 'liability',
                    'parent_id' => $memberDeposits->id,
                    'description' => 'Interest owed to members on their deposits',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2015',
                    'name' => 'Interest in Probation / Suspense',
                    'type' => 'liability',
                    'parent_id' => $memberDeposits->id,
                    'description' => 'Interest pending verification or under probation',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2016',
                    'name' => 'Interest Probation Expired / Forfeited',
                    'type' => 'liability',
                    'parent_id' => $memberDeposits->id,
                    'description' => 'Interest forfeited after probation period expiration',
                    'is_control_account' => true,
                ],
            ]);

            // ----------------------------
            // PAYABLES (2110)
            // ----------------------------
            $payables = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2110',
                'name' => 'Payables',
                'type' => 'liability',
                'parent_id' => $currentLiabilities->id,
                'description' => 'Amounts payable to vendors, employees, and others',
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organization->id,
                    'code' => '2111',
                    'name' => 'Vendor Payables',
                    'type' => 'liability',
                    'parent_id' => $payables->id,
                    'description' => 'Amounts owed to suppliers and vendors',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2112',
                    'name' => 'Salaries & Benefits Payable',
                    'type' => 'liability',
                    'parent_id' => $payables->id,
                    'description' => 'Unpaid salaries and employee benefits',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2113',
                    'name' => 'Tax Payable',
                    'type' => 'liability',
                    'parent_id' => $payables->id,
                    'description' => 'Taxes owed to government authorities',
                    'is_control_account' => true,
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '2114',
                    'name' => 'Accrued Expenses / Other Payables',
                    'type' => 'liability',
                    'parent_id' => $payables->id,
                    'description' => 'Expenses incurred but not yet paid',
                    'is_control_account' => true,
                ],
            ]);

            // ----------------------------
            // SUSPENSE ACCOUNTS (2200)
            // ----------------------------
            $suspense = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2200',
                'name' => 'Suspense Accounts',
                'type' => 'liability',
                'parent_id' => $liabilities->id,
                'description' => 'Temporarily held transactions pending classification',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '2201',
                'name' => 'General Suspense',
                'type' => 'liability',
                'parent_id' => $suspense->id,
                'description' => 'Unclassified or temporary liability entries',
            ]);

            // ----------------------------
            // EQUITY (3000)
            // ----------------------------
            $equity = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3000',
                'name' => 'Equity',
                'type' => 'equity',
                'description' => 'Owners’ capital and accumulated profits',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3010',
                'name' => 'Share Capital',
                'type' => 'equity',
                'parent_id' => $equity->id,
                'description' => 'Capital contributed by shareholders or members',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '3020',
                'name' => 'Retained Earnings',
                'type' => 'equity',
                'parent_id' => $equity->id,
                'description' => 'Accumulated profits retained in the organization',
            ]);

            // ----------------------------
            // INCOME (4000)
            // ----------------------------
            $income = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4000',
                'name' => 'Income',
                'type' => 'income',
                'description' => 'Revenue earned from core and other operations',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Loan Related Income
            |--------------------------------------------------------------------------
            */
            $loanIncome = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4100',
                'name' => 'Loan Income',
                'type' => 'income',
                'parent_id' => $income->id,
                'description' => 'Revenue generated from loans provided to members/customers',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4101',
                'name' => 'Loan Interest Income',
                'type' => 'income',
                'parent_id' => $loanIncome->id,
                'description' => 'Interest earned from outstanding loan balances',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4102',
                'name' => 'Late Payment Fine',
                'type' => 'income',
                'parent_id' => $loanIncome->id,
                'description' => 'Penalties collected for late loan repayments',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4103',
                'name' => 'Loan Insurance Fee',
                'type' => 'income',
                'parent_id' => $loanIncome->id,
                'description' => 'Insurance fees charged on loans',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4104',
                'name' => 'Insurance Renewal Fee',
                'type' => 'income',
                'parent_id' => $loanIncome->id,
                'description' => 'Fees from renewal of loan-related insurance policies',
                'is_control_account' => true,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Service / Software Income
            |--------------------------------------------------------------------------
            */
            $serviceIncome = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4200',
                'name' => 'Service Income',
                'type' => 'income',
                'parent_id' => $income->id,
                'description' => 'Revenue from software, IT, and other services',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4201',
                'name' => 'Installation Income',
                'type' => 'income',
                'parent_id' => $serviceIncome->id,
                'description' => 'Fees for installation services provided to clients',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4202',
                'name' => 'Migration Income',
                'type' => 'income',
                'parent_id' => $serviceIncome->id,
                'description' => 'Revenue from data or system migration projects',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4203',
                'name' => 'Monthly Service Income',
                'type' => 'income',
                'parent_id' => $serviceIncome->id,
                'description' => 'Recurring monthly charges for service subscriptions',
                'is_control_account' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4204',
                'name' => 'Support & Maintenance Income',
                'type' => 'income',
                'parent_id' => $serviceIncome->id,
                'description' => 'Revenue from ongoing support and maintenance contracts',
                'is_control_account' => true,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Other Income
            |--------------------------------------------------------------------------
            */
            $otherIncome = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '4300',
                'name' => 'Other Income',
                'type' => 'income',
                'parent_id' => $income->id,
                'description' => 'Miscellaneous or non-core income sources',
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organization->id,
                    'code' => '4301',
                    'name' => 'Interest Income (Non-Loan)',
                    'type' => 'income',
                    'parent_id' => $otherIncome->id,
                    'description' => 'Interest earned from investments or deposits',
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '4310',
                    'name' => 'Gain on Sale of Assets',
                    'type' => 'income',
                    'parent_id' => $otherIncome->id,
                    'description' => 'Profit from selling company assets',
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '4320',
                    'name' => 'Gain on Sale of Non-Assets',
                    'type' => 'income',
                    'parent_id' => $otherIncome->id,
                    'description' => 'Profit from selling items not classified as assets',
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '4330',
                    'name' => 'Miscellaneous Income',
                    'type' => 'income',
                    'parent_id' => $otherIncome->id,
                    'description' => 'One-off or incidental income items',
                ],
                [
                    'organization_id' => $organization->id,
                    'code' => '4340',
                    'name' => 'Service Fees (One-Off / Non-Regular)',
                    'type' => 'income',
                    'parent_id' => $otherIncome->id,
                    'description' => 'Non-recurring service fee income',
                ],
            ]);

            // ----------------------------
            // EXPENSES (5000)
            // ----------------------------
            $expenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5000',
                'name' => 'Expenses',
                'type' => 'expense',
                'description' => 'All operating, financial, and other expenses',
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
                'description' => 'Day-to-day operational costs',
            ]);

            LedgerAccount::insert([
                // Human Resources
                ['organization_id' => $organization->id, 'code' => '5101', 'name' => 'Salaries & Wages', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Employee salary payments'],
                ['organization_id' => $organization->id, 'code' => '5102', 'name' => 'Employee Benefits & Allowances', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Benefits, insurance, and allowances'],

                // Office/Admin
                ['organization_id' => $organization->id, 'code' => '5103', 'name' => 'Office Rent', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Rental payments for office premises'],
                ['organization_id' => $organization->id, 'code' => '5104', 'name' => 'Office Utilities', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Electricity, water, and utility bills'],
                ['organization_id' => $organization->id, 'code' => '5105', 'name' => 'Office Supplies & Stationery', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Consumables for office operations'],
                ['organization_id' => $organization->id, 'code' => '5106', 'name' => 'Printing & Photocopy', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Printing and copying costs'],
                ['organization_id' => $organization->id, 'code' => '5107', 'name' => 'Cleaning & Pantry Supplies', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Cleaning materials and pantry consumables'],
                ['organization_id' => $organization->id, 'code' => '5108', 'name' => 'Courier & Delivery', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Postage and delivery expenses'],

                // IT / Tech
                ['organization_id' => $organization->id, 'code' => '5110', 'name' => 'IT Software & Licenses', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Software licenses and subscriptions'],
                ['organization_id' => $organization->id, 'code' => '5111', 'name' => 'IT Hardware & Maintenance', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Hardware costs and maintenance'],
                ['organization_id' => $organization->id, 'code' => '5112', 'name' => 'Internet & Telecommunications', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Internet, phone, and telecom charges'],

                // Member / Service Expenses
                ['organization_id' => $organization->id, 'code' => '5120', 'name' => 'Member Services Expenses', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Costs of services provided to members'],
                ['organization_id' => $organization->id, 'code' => '5121', 'name' => 'Promotional & Marketing Expenses', 'type' => 'expense', 'parent_id' => $operatingExpenses->id, 'description' => 'Advertising, promotions, and marketing campaigns'],
            ]);

            // ----------------------------
            // PETTY CASH EXPENSES (5130)
            // ----------------------------
            $pettyCashExpenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5130',
                'name' => 'Petty Cash Expenses',
                'type' => 'expense',
                'parent_id' => $operatingExpenses->id,
                'description' => 'Expenses incurred via petty cash',
            ]);

            LedgerAccount::insert([
                ['organization_id' => $organization->id, 'code' => '5131', 'name' => 'Petty Cash - Travel', 'type' => 'expense', 'parent_id' => $pettyCashExpenses->id],
                ['organization_id' => $organization->id, 'code' => '5132', 'name' => 'Petty Cash - Refreshments', 'type' => 'expense', 'parent_id' => $pettyCashExpenses->id],
                ['organization_id' => $organization->id, 'code' => '5133', 'name' => 'Petty Cash - Office Misc', 'type' => 'expense', 'parent_id' => $pettyCashExpenses->id],
                ['organization_id' => $organization->id, 'code' => '5134', 'name' => 'Petty Cash - Repairs', 'type' => 'expense', 'parent_id' => $pettyCashExpenses->id],
                ['organization_id' => $organization->id, 'code' => '5135', 'name' => 'Petty Cash - Staff Welfare', 'type' => 'expense', 'parent_id' => $pettyCashExpenses->id],
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
                'description' => 'Interest and other financial costs',
            ]);

            LedgerAccount::insert([
                ['organization_id' => $organization->id, 'code' => '5201', 'name' => 'Savings Interest Expense', 'type' => 'expense', 'parent_id' => $financialExpenses->id, 'description' => 'Interest paid on savings accounts'],
                ['organization_id' => $organization->id, 'code' => '5202', 'name' => 'Fixed Deposit Interest Expense', 'type' => 'expense', 'parent_id' => $financialExpenses->id, 'description' => 'Interest on fixed deposits'],
                ['organization_id' => $organization->id, 'code' => '5203', 'name' => 'Term Deposit Interest Expense', 'type' => 'expense', 'parent_id' => $financialExpenses->id, 'description' => 'Interest on term deposits'],
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
                'description' => 'Funds set aside for potential liabilities or losses',
            ]);

            LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5301',
                'name' => 'Provision For Loan Losses',
                'type' => 'expense',
                'parent_id' => $provisions->id,
                'description' => 'Estimated losses from bad loans',
            ]);

            // ----------------------------
            // NON-OPERATING / OTHER EXPENSES (5400)
            // ----------------------------
            $otherExpenses = LedgerAccount::create([
                'organization_id' => $organization->id,
                'code' => '5400',
                'name' => 'Other Expenses',
                'type' => 'expense',
                'parent_id' => $expenses->id,
                'description' => 'Non-core or one-off expenses',
            ]);

            LedgerAccount::insert([
                ['organization_id' => $organization->id, 'code' => '5401', 'name' => 'Loss on Sale of Assets', 'type' => 'expense', 'parent_id' => $otherExpenses->id, 'description' => 'Loss incurred on asset disposals'],
                ['organization_id' => $organization->id, 'code' => '5402', 'name' => 'Write-Offs / Bad Debts', 'type' => 'expense', 'parent_id' => $otherExpenses->id, 'description' => 'Unrecoverable debts or write-offs'],
                ['organization_id' => $organization->id, 'code' => '5403', 'name' => 'Fines & Penalties', 'type' => 'expense', 'parent_id' => $otherExpenses->id, 'description' => 'Legal fines or regulatory penalties'],
            ]);

            $this->command->info('✅ full Banking-Grade COA Seeded Successfully!');
        });
    }
}