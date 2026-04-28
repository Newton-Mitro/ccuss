<?php

namespace Database\Seeders;

use App\SubledgerModule\Models\Subledger;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;

class ChartOfAccountsSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            $organizationGroup = Organization::first() ?? Organization::factory()->create();
            // ----------------------------
            // ASSETS (1000)
            // ----------------------------
            $assetsGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1000',
                'name' => 'Assets',
                'type' => 'asset',
                'description' => 'All organizational assets',
                'is_group' => true,
            ]);

            $currentAssetsGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1100',
                'name' => 'Current Assets',
                'type' => 'asset',
                'parent_id' => $assetsGroup->id,
                'description' => 'Short-term assets convertible to cash within a year',
                'is_group' => true,
            ]);

            $fixedAssetsGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1200',
                'name' => 'Fixed Assets',
                'type' => 'asset',
                'parent_id' => $assetsGroup->id,
                'description' => 'Long-term tangible assets for operational use',
                'is_group' => true,
            ]);

            // CASH & BANK
            $cashGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1110',
                'name' => 'Cash and Cash Equivalents',
                'type' => 'asset',
                'parent_id' => $currentAssetsGroup->id,
                'description' => 'Cash and cash equivalents',
                'is_group' => true,
            ]);

            $bankAccounts = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1112',
                'name' => 'Bank Accounts',
                'type' => 'asset',
                'parent_id' => $cashGroup->id,
                'description' => 'Cash held in bank accounts',
                'is_control_account' => true,
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'bank_accounts',
            ]);

            Subledger::create([
                'code' => '1112',
                'name' => 'Bank Accounts',
                'short_name' => 'Bank Accounts',
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'bank_accounts',
                'is_active' => true,
                'gl_account_id' => $bankAccounts->id,
            ]);

            $pettyCashes = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1113',
                'name' => 'Petty Cashes',
                'type' => 'asset',
                'parent_id' => $cashGroup->id,
                'description' => 'Small cash for daily operational expenses',
                'is_control_account' => true,
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'petty_cashes',
            ]);

            Subledger::create([
                'code' => '1113',
                'name' => 'Petty Cashes',
                'short_name' => 'Petty Cashes',
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'petty_cashes',
                'is_active' => true,
                'gl_account_id' => $pettyCashes->id,
            ]);

            $vaultCashes = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1114',
                'name' => 'Vault Cashes',
                'type' => 'asset',
                'parent_id' => $cashGroup->id,
                'description' => 'Cash stored securely in vault',
                'is_control_account' => true,
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'vault_cashes',
            ]);

            Subledger::create([
                'code' => '1114',
                'name' => 'Vault Cashes',
                'short_name' => 'Vault Cashes',
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'vault_cashes',
                'is_active' => true,
                'gl_account_id' => $vaultCashes->id,
            ]);

            $tellerCashes = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1115',
                'name' => 'Teller Cashes',
                'type' => 'asset',
                'parent_id' => $cashGroup->id,
                'description' => 'Cash held by teller for transactions',
                'is_control_account' => true,
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'teller_cashes',
            ]);

            Subledger::create([
                'code' => '1115',
                'name' => 'Teller Cashes',
                'short_name' => 'Teller Cashes',
                'subledger_type' => 'cash_and_cash_equivalents',
                'subledger_sub_type' => 'teller_cashes',
                'is_active' => true,
                'gl_account_id' => $tellerCashes->id,
            ]);

            // ----------------------------
            // EMPLOYEE ADVANCES (1300) ✅ CRITICAL
            // ----------------------------
            $employeeAdvancesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1300',
                'name' => 'Employee Advances',
                'type' => 'asset',
                'parent_id' => $currentAssetsGroup->id,
                'description' => 'Advances given to employees',
                'is_group' => true,
            ]);

            $pettyCashAdvances = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '13001',
                'name' => 'Petty Cash Advances',
                'type' => 'asset',
                'parent_id' => $employeeAdvancesGroup->id,
                'is_control_account' => true,
                'subledger_type' => 'employee_advances',
                'subledger_sub_type' => 'petty_cash_advances',
            ]);

            Subledger::create([
                'code' => '13001',
                'name' => 'Petty Cash Advances',
                'short_name' => 'Petty Cash Advances',
                'subledger_type' => 'employee_advances',
                'subledger_sub_type' => 'petty_cash_advances',
                'is_active' => true,
                'gl_account_id' => $pettyCashAdvances->id,
            ]);

            $advanceSalaries = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '13002',
                'name' => 'Advance Salaries',
                'type' => 'asset',
                'parent_id' => $employeeAdvancesGroup->id,
                'is_control_account' => true,
                'subledger_type' => 'employee_advances',
                'subledger_sub_type' => 'advance_salaries',
            ]);

            Subledger::create([
                'code' => '13002',
                'name' => 'Advance Salaries',
                'short_name' => 'Advance Salaries',
                'subledger_type' => 'employee_advances',
                'subledger_sub_type' => 'advance_salaries',
                'is_active' => true,
                'gl_account_id' => $advanceSalaries->id,
            ]);

            // RECEIVABLES
            $receivablesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1130',
                'name' => 'Accounts Receivable',
                'type' => 'asset',
                'parent_id' => $currentAssetsGroup->id,
                'description' => 'Amounts due from customers',
                'is_group' => true,
            ]);

            // Loan Receivables
            $loanReceivablesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1131',
                'name' => 'Loan Receivables',
                'type' => 'asset',
                'parent_id' => $receivablesGroup->id,
                'description' => 'Outstanding loan amounts from borrowers',
                'is_group' => true,
            ]);

            $interestReceivables = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '11311',
                'name' => 'Interest Receivables',
                'type' => 'asset',
                'parent_id' => $loanReceivablesGroup->id,
                'description' => 'Accrued interest on loans',
                'is_control_account' => true,
                'subledger_type' => 'loan_receivables',
                'subledger_sub_type' => 'interest_receivables',
            ]);

            Subledger::create([
                'code' => '11311',
                'name' => 'Interest Receivables',
                'short_name' => 'Interest Receivables',
                'subledger_type' => 'loan_receivables',
                'subledger_sub_type' => 'interest_receivables',
                'is_active' => true,
                'gl_account_id' => $interestReceivables->id,
            ]);

            // Loan Portfolio
            $loansGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1140',
                'name' => 'Loans',
                'type' => 'asset',
                'parent_id' => $currentAssetsGroup->id,
                'description' => 'All loans provided to borrowers',
                'is_group' => true,
            ]);

            $generalLoans = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1141',
                'name' => 'General Loans',
                'type' => 'asset',
                'parent_id' => $loansGroup->id,
                'description' => 'General purpose loans',
                'is_control_account' => true,
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'general_loans',
            ], );

            Subledger::create([
                'code' => '1141',
                'name' => 'General Loans',
                'short_name' => 'General Loans',
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'general_loans',
                'is_active' => true,
                'gl_account_id' => $generalLoans->id,
            ]);

            $educationLoans = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1142',
                'name' => 'Education Loans',
                'type' => 'asset',
                'parent_id' => $loansGroup->id,
                'description' => 'Loans provided for educational purposes',
                'is_control_account' => true,
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'education_loans',
            ]);

            Subledger::create([
                'code' => '1142',
                'name' => 'Education Loans',
                'short_name' => 'Education Loans',
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'education_loans',
                'is_active' => true,
                'gl_account_id' => $educationLoans->id,
            ]);

            $housingLoans = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1143',
                'name' => 'Housing Loans',
                'type' => 'asset',
                'parent_id' => $loansGroup->id,
                'description' => 'Loans provided for housing purposes',
                'is_control_account' => true,
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'housing_loans',
            ]);

            Subledger::create([
                'code' => '1143',
                'name' => 'Housing Loans',
                'short_name' => 'Housing Loans',
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'housing_loans',
                'is_active' => true,
                'gl_account_id' => $housingLoans->id,
            ]);

            $smeLoans = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1144',
                'name' => 'SME Loans',
                'type' => 'asset',
                'parent_id' => $loansGroup->id,
                'description' => 'Loans for small and medium enterprises',
                'is_control_account' => true,
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'sme_loans',
            ]);

            Subledger::create([
                'code' => '1144',
                'name' => 'SME Loans',
                'short_name' => 'SME Loans',
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'sme_loans',
                'is_active' => true,
                'gl_account_id' => $smeLoans->id,
            ]);

            $vehicleLoans = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1145',
                'name' => 'Vehicle Loans',
                'type' => 'asset',
                'parent_id' => $loansGroup->id,
                'description' => 'Loans provided for vehicle purchases',
                'is_control_account' => true,
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'vehicle_loans',
            ]);

            Subledger::create([
                'code' => '1145',
                'name' => 'Vehicle Loans',
                'short_name' => 'Vehicle Loans',
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'vehicle_loans',
                'is_active' => true,
                'gl_account_id' => $vehicleLoans->id,
            ]);

            $agriculturalLoans = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1146',
                'name' => 'Agricultural Loans',
                'type' => 'asset',
                'parent_id' => $loansGroup->id,
                'description' => 'Loans provided for agricultural purposes',
                'is_control_account' => true,
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'agricultural_loans',
            ]);

            Subledger::create([
                'code' => '1146',
                'name' => 'Agricultural Loans',
                'short_name' => 'Agricultural Loans',
                'subledger_type' => 'loans',
                'subledger_sub_type' => 'agricultural_loans',
                'is_active' => true,
                'gl_account_id' => $agriculturalLoans->id,
            ]);

            // Fixed Assets
            LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1201',
                'name' => 'Land',
                'type' => 'asset',
                'parent_id' => $fixedAssetsGroup->id,
                'description' => 'Land owned by the organization',
            ]);

            LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1202',
                'name' => 'Building',
                'type' => 'asset',
                'parent_id' => $fixedAssetsGroup->id,
                'description' => 'Buildings owned by the organization',
            ]);

            LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '1203',
                'name' => 'Office Equipment',
                'type' => 'asset',
                'parent_id' => $fixedAssetsGroup->id,
                'description' => 'Office furniture and equipment',
            ]);

            // ----------------------------
            // LIABILITIES (2000)
            // ----------------------------
            $liabilitiesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2000',
                'name' => 'Liabilities',
                'type' => 'liability',
                'description' => 'All organizational obligations',
                'is_group' => true,
            ]);

            // ----------------------------
            // CURRENT LIABILITIES (2100)
            // ----------------------------
            $currentLiabilitiesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2100',
                'name' => 'Current Liabilities',
                'type' => 'liability',
                'parent_id' => $liabilitiesGroup->id,
                'description' => 'Obligations due within one year',
                'is_group' => true,
            ]);

            // ----------------------------
            // MEMBER DEPOSITS (2010)
            // ----------------------------
            $memberDepositsGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2010',
                'name' => 'Member Deposits',
                'type' => 'liability',
                'parent_id' => $currentLiabilitiesGroup->id,
                'description' => 'Deposits made by members/customers',
                'is_group' => true,
            ]);

            $savingDeposits = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2011',
                'name' => 'Savings Deposits',
                'type' => 'liability',
                'parent_id' => $memberDepositsGroup->id,
                'description' => 'Deposits in member savings accounts',
                'is_control_account' => true,
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'saving_deposits',
            ]);

            Subledger::create([
                'code' => '2011',
                'name' => 'Savings Deposits',
                'short_name' => 'Savings Deposits',
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'saving_deposits',
                'is_active' => true,
                'gl_account_id' => $savingDeposits->id,
            ]);

            $termDeposits = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2012',
                'name' => 'Term Deposits',
                'type' => 'liability',
                'parent_id' => $memberDepositsGroup->id,
                'description' => 'Time-bound fixed deposits from members',
                'is_control_account' => true,
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'term_deposits',
            ]);

            Subledger::create([
                'code' => '2012',
                'name' => 'Term Deposits',
                'short_name' => 'Term Deposits',
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'term_deposits',
                'is_active' => true,
                'gl_account_id' => $termDeposits->id,
            ]);

            $recurringDeposits = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2013',
                'name' => 'Recurring Deposits',
                'type' => 'liability',
                'parent_id' => $memberDepositsGroup->id,
                'description' => 'Recurring deposits from members',
                'is_control_account' => true,
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'recurring_deposits',
            ]);

            Subledger::create([
                'code' => '2013',
                'name' => 'Recurring Deposits',
                'short_name' => 'Recurring Deposits',
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'recurring_deposits',
                'is_active' => true,
                'gl_account_id' => $recurringDeposits->id,
            ]);

            $interestPayables = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2014',
                'name' => 'Interest Payables',
                'type' => 'liability',
                'parent_id' => $memberDepositsGroup->id,
                'description' => 'Interest owed to members on their deposits',
                'is_control_account' => true,
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'interest_payables',
            ]);

            Subledger::create([
                'code' => '2014',
                'name' => 'Interest Payables',
                'short_name' => 'Interest Payables',
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'interest_payables',
                'is_active' => true,
                'gl_account_id' => $interestPayables->id,
            ]);

            $interestProbations = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2015',
                'name' => 'Interest in Probations / Suspense',
                'type' => 'liability',
                'parent_id' => $memberDepositsGroup->id,
                'description' => 'Interest pending verification or under probation',
                'is_control_account' => true,
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'interest_probations',
            ]);

            Subledger::create([
                'code' => '2015',
                'name' => 'Interest in Probations / Suspense',
                'short_name' => 'Interest in Probations / Suspense',
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'interest_probations',
                'is_active' => true,
                'gl_account_id' => $interestProbations->id,
            ]);

            $interestProbationsExpired = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2016',
                'name' => 'Interest Probation Expired / Forfeited',
                'type' => 'liability',
                'parent_id' => $memberDepositsGroup->id,
                'description' => 'Interest forfeited after probation period expiration',
                'is_control_account' => true,
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'interest_forfeited',
            ]);

            Subledger::create([
                'code' => '2016',
                'name' => 'Interest Probation Expired / Forfeited',
                'short_name' => 'Interest Probation Expired / Forfeited',
                'subledger_type' => 'member_deposits',
                'subledger_sub_type' => 'interest_forfeited',
                'is_active' => true,
                'gl_account_id' => $interestProbationsExpired->id,
            ]);

            // ----------------------------
            // PAYABLES (2110)
            // ----------------------------
            $payablesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2110',
                'name' => 'Payables',
                'type' => 'liability',
                'parent_id' => $currentLiabilitiesGroup->id,
                'description' => 'Amounts payable to vendors, employees, and others',
                'is_group' => true,
            ]);

            $vendorPayables = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2111',
                'name' => 'Vendor Payables',
                'type' => 'liability',
                'parent_id' => $payablesGroup->id,
                'description' => 'Amounts owed to suppliers and vendors',
                'is_control_account' => true,
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'vendor_payables',
            ]);

            Subledger::create([
                'code' => '2111',
                'name' => 'Vendor Payables',
                'short_name' => 'Vendor Payables',
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'vendor_payables',
                'is_active' => true,
                'gl_account_id' => $vendorPayables->id,
            ]);

            $salariesPayables = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2112',
                'name' => 'Salaries & Benefits Payable',
                'type' => 'liability',
                'parent_id' => $payablesGroup->id,
                'description' => 'Unpaid salaries and employee benefits',
                'is_control_account' => true,
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'salaries_benefits_payables',
            ]);

            Subledger::create([
                'code' => '2112',
                'name' => 'Salaries & Benefits Payable',
                'short_name' => 'Salaries & Benefits Payable',
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'salaries_benefits_payables',
                'is_active' => true,
                'gl_account_id' => $salariesPayables->id,
            ]);

            $taxPayables = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2113',
                'name' => 'Tax Payable',
                'type' => 'liability',
                'parent_id' => $payablesGroup->id,
                'description' => 'Taxes owed to government authorities',
                'is_control_account' => true,
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'tax_payables',
            ]);

            Subledger::create([
                'code' => '2113',
                'name' => 'Tax Payable',
                'short_name' => 'Tax Payable',
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'tax_payables',
                'is_active' => true,
                'gl_account_id' => $taxPayables->id,
            ]);

            $accruedExpensesOtherPayables = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2114',
                'name' => 'Accrued Expenses / Other Payables',
                'type' => 'liability',
                'parent_id' => $payablesGroup->id,
                'description' => 'Expenses incurred but not yet paid',
                'is_control_account' => true,
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'accrued_expenses_other_payables',
            ]);

            Subledger::create([
                'code' => '2114',
                'name' => 'Accrued Expenses / Other Payables',
                'short_name' => 'Accrued Expenses / Other Payables',
                'subledger_type' => 'payables',
                'subledger_sub_type' => 'accrued_expenses_other_payables',
                'is_active' => true,
                'gl_account_id' => $accruedExpensesOtherPayables->id,
            ]);

            // ----------------------------
            // SUSPENSE ACCOUNTS (2200)
            // ----------------------------
            $suspenseGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2200',
                'name' => 'Suspense Accounts',
                'type' => 'liability',
                'parent_id' => $liabilitiesGroup->id,
                'description' => 'Temporarily held transactions pending classification',
                'is_group' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '2201',
                'name' => 'General Suspense',
                'type' => 'liability',
                'parent_id' => $suspenseGroup->id,
                'description' => 'Unclassified or temporary liability entries',
            ]);

            // ----------------------------
            // EQUITY (3000)
            // ----------------------------
            $equityGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '3000',
                'name' => 'Equity',
                'type' => 'equity',
                'description' => 'Owners’ capital and accumulated profits',
                'is_group' => true,
            ]);

            $shareCapitals = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '3010',
                'name' => 'Share Capitals',
                'type' => 'equity',
                'parent_id' => $equityGroup->id,
                'description' => 'Capital contributed by shareholders or members',
                'is_control_account' => true,
                'subledger_type' => 'equity',
                'subledger_sub_type' => 'share_capitals',
            ]);

            Subledger::create([
                'code' => '3010',
                'name' => 'Share Capitals',
                'short_name' => 'Share Capitals',
                'subledger_type' => 'equity',
                'subledger_sub_type' => 'share_capitals',
                'is_active' => true,
                'gl_account_id' => $shareCapitals->id,
            ]);

            LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '3020',
                'name' => 'Retained Earnings',
                'type' => 'equity',
                'parent_id' => $equityGroup->id,
                'description' => 'Accumulated profits retained in the organization',
            ]);

            // ----------------------------
            // INCOME (4000)
            // ----------------------------
            $incomeGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4000',
                'name' => 'Income',
                'type' => 'income',
                'description' => 'Revenue earned from core and other operations',
                'is_group' => true,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Loan Related Income
            |--------------------------------------------------------------------------
            */
            $loanIncomeGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4100',
                'name' => 'Loan Incomes',
                'type' => 'income',
                'parent_id' => $incomeGroup->id,
                'description' => 'Revenue generated from loans provided to members/customers',
                'is_group' => true,
            ]);

            $loanInterestIncomes = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4101',
                'name' => 'Loan Interest Incomes',
                'type' => 'income',
                'parent_id' => $loanIncomeGroup->id,
                'description' => 'Interest earned from outstanding loan balances',
                'is_control_account' => true,
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'loan_interest_incomes',
            ]);

            Subledger::create([
                'code' => '4101',
                'name' => 'Loan Interest Incomes',
                'short_name' => 'Loan Interest Incomes',
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'loan_interest_incomes',
                'is_active' => true,
                'gl_account_id' => $loanInterestIncomes->id,
            ]);

            $latePaymentFines = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4102',
                'name' => 'Late Payment Fines',
                'type' => 'income',
                'parent_id' => $loanIncomeGroup->id,
                'description' => 'Penalties collected for late loan repayments',
                'is_control_account' => true,
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'late_payment_fines',
            ]);

            Subledger::create([
                'code' => '4102',
                'name' => 'Late Payment Fines',
                'short_name' => 'Late Payment Fines',
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'late_payment_fines',
                'is_active' => true,
                'gl_account_id' => $latePaymentFines->id,
            ]);

            $loanInsuranceFees = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4103',
                'name' => 'Loan Insurance Fees',
                'type' => 'income',
                'parent_id' => $loanIncomeGroup->id,
                'description' => 'Insurance fees charged on loans',
                'is_control_account' => true,
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'loan_insurance_fees',
            ]);

            Subledger::create([
                'code' => '4103',
                'name' => 'Loan Insurance Fees',
                'short_name' => 'Loan Insurance Fees',
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'loan_insurance_fees',
                'is_active' => true,
                'gl_account_id' => $loanInsuranceFees->id,
            ]);

            $insuranceRenewalFees = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4104',
                'name' => 'Insurance Renewal Fees',
                'type' => 'income',
                'parent_id' => $loanIncomeGroup->id,
                'description' => 'Fees from renewal of loan-related insurance policies',
                'is_control_account' => true,
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'insurance_renewal_fees',
            ]);

            Subledger::create([
                'code' => '4104',
                'name' => 'Insurance Renewal Fees',
                'short_name' => 'Insurance Renewal Fees',
                'subledger_type' => 'loan_incomes',
                'subledger_sub_type' => 'insurance_renewal_fees',
                'is_active' => true,
                'gl_account_id' => $insuranceRenewalFees->id,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Other Income
            |--------------------------------------------------------------------------
            */
            $otherIncomeGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '4300',
                'name' => 'Other Income',
                'type' => 'income',
                'parent_id' => $incomeGroup->id,
                'description' => 'Miscellaneous or non-core income sources',
                'is_group' => true,
            ]);

            LedgerAccount::insert([
                [
                    'organization_id' => $organizationGroup->id,
                    'code' => '4301',
                    'name' => 'Interest Income (Non-Loan)',
                    'type' => 'income',
                    'parent_id' => $otherIncomeGroup->id,
                    'description' => 'Interest earned from investments or deposits',
                ],
                [
                    'organization_id' => $organizationGroup->id,
                    'code' => '4310',
                    'name' => 'Gain on Sale of Assets',
                    'type' => 'income',
                    'parent_id' => $otherIncomeGroup->id,
                    'description' => 'Profit from selling company assets',
                ],
                [
                    'organization_id' => $organizationGroup->id,
                    'code' => '4320',
                    'name' => 'Gain on Sale of Non-Assets',
                    'type' => 'income',
                    'parent_id' => $otherIncomeGroup->id,
                    'description' => 'Profit from selling items not classified as assets',
                ],
                [
                    'organization_id' => $organizationGroup->id,
                    'code' => '4330',
                    'name' => 'Miscellaneous Income',
                    'type' => 'income',
                    'parent_id' => $otherIncomeGroup->id,
                    'description' => 'One-off or incidental income items',
                ],
                [
                    'organization_id' => $organizationGroup->id,
                    'code' => '4340',
                    'name' => 'Service Fees (One-Off / Non-Regular)',
                    'type' => 'income',
                    'parent_id' => $otherIncomeGroup->id,
                    'description' => 'Non-recurring service fee income',
                ],
            ]);

            // ----------------------------
            // EXPENSES (5000)
            // ----------------------------
            $expensesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5000',
                'name' => 'Expenses',
                'type' => 'expense',
                'description' => 'All operating, financial, and other expenses',
                'is_group' => true,
            ]);

            // ----------------------------
            // OPERATING EXPENSES (5100)
            // ----------------------------
            $operatingExpensesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5100',
                'name' => 'Operating Expenses',
                'type' => 'expense',
                'parent_id' => $expensesGroup->id,
                'description' => 'Day-to-day operational costs',
                'is_group' => true,
            ]);

            LedgerAccount::insert([
                // Human Resources
                ['organization_id' => $organizationGroup->id, 'code' => '5101', 'name' => 'Salaries & Wages', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Employee salary payments'],
                ['organization_id' => $organizationGroup->id, 'code' => '5102', 'name' => 'Employee Benefits & Allowances', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Benefits, insurance, and allowances'],

                // Office/Admin
                ['organization_id' => $organizationGroup->id, 'code' => '5103', 'name' => 'Office Rent', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Rental payments for office premises'],
                ['organization_id' => $organizationGroup->id, 'code' => '5104', 'name' => 'Office Utilities', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Electricity, water, and utility bills'],
                ['organization_id' => $organizationGroup->id, 'code' => '5105', 'name' => 'Office Supplies & Stationery', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Consumables for office operations'],
                ['organization_id' => $organizationGroup->id, 'code' => '5106', 'name' => 'Printing & Photocopy', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Printing and copying costs'],
                ['organization_id' => $organizationGroup->id, 'code' => '5107', 'name' => 'Cleaning & Pantry Supplies', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Cleaning materials and pantry consumables'],
                ['organization_id' => $organizationGroup->id, 'code' => '5108', 'name' => 'Courier & Delivery', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Postage and delivery expenses'],

                // IT / Tech
                ['organization_id' => $organizationGroup->id, 'code' => '5110', 'name' => 'IT Software & Licenses', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Software licenses and subscriptions'],
                ['organization_id' => $organizationGroup->id, 'code' => '5111', 'name' => 'IT Hardware & Maintenance', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Hardware costs and maintenance'],
                ['organization_id' => $organizationGroup->id, 'code' => '5112', 'name' => 'Internet & Telecommunications', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Internet, phone, and telecom charges'],

                // Member / Service Expenses
                ['organization_id' => $organizationGroup->id, 'code' => '5120', 'name' => 'Member Services Expenses', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Costs of services provided to members'],
                ['organization_id' => $organizationGroup->id, 'code' => '5121', 'name' => 'Promotional & Marketing Expenses', 'type' => 'expense', 'parent_id' => $operatingExpensesGroup->id, 'description' => 'Advertising, promotions, and marketing campaigns'],
            ]);

            // ----------------------------
            // PETTY CASH EXPENSES (5130)
            // ----------------------------
            $pettyCashExpensesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5130',
                'name' => 'Petty Cash Expenses',
                'type' => 'expense',
                'parent_id' => $operatingExpensesGroup->id,
                'description' => 'Expenses incurred via petty cash',
                'is_group' => true,
            ]);

            LedgerAccount::insert([
                ['organization_id' => $organizationGroup->id, 'code' => '5131', 'name' => 'Petty Cash - Travel', 'type' => 'expense', 'parent_id' => $pettyCashExpensesGroup->id],
                ['organization_id' => $organizationGroup->id, 'code' => '5132', 'name' => 'Petty Cash - Refreshments', 'type' => 'expense', 'parent_id' => $pettyCashExpensesGroup->id],
                ['organization_id' => $organizationGroup->id, 'code' => '5133', 'name' => 'Petty Cash - Office Misc', 'type' => 'expense', 'parent_id' => $pettyCashExpensesGroup->id],
                ['organization_id' => $organizationGroup->id, 'code' => '5134', 'name' => 'Petty Cash - Repairs', 'type' => 'expense', 'parent_id' => $pettyCashExpensesGroup->id],
                ['organization_id' => $organizationGroup->id, 'code' => '5135', 'name' => 'Petty Cash - Staff Welfare', 'type' => 'expense', 'parent_id' => $pettyCashExpensesGroup->id],
            ]);

            // ----------------------------
            // FINANCIAL EXPENSES (5200)
            // ----------------------------
            $financialExpensesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5200',
                'name' => 'Financial Expenses',
                'type' => 'expense',
                'parent_id' => $expensesGroup->id,
                'description' => 'Interest and other financial costs',
                'is_group' => true,
            ]);

            LedgerAccount::insert([
                ['organization_id' => $organizationGroup->id, 'code' => '5201', 'name' => 'Savings Interest Expense', 'type' => 'expense', 'parent_id' => $financialExpensesGroup->id, 'description' => 'Interest paid on savings accounts'],
                ['organization_id' => $organizationGroup->id, 'code' => '5202', 'name' => 'Fixed Deposit Interest Expense', 'type' => 'expense', 'parent_id' => $financialExpensesGroup->id, 'description' => 'Interest on fixed deposits'],
                ['organization_id' => $organizationGroup->id, 'code' => '5203', 'name' => 'Term Deposit Interest Expense', 'type' => 'expense', 'parent_id' => $financialExpensesGroup->id, 'description' => 'Interest on term deposits'],
            ]);

            // ----------------------------
            // PROVISIONS (5300)
            // ----------------------------
            $provisionsGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5300',
                'name' => 'Provisions',
                'type' => 'expense',
                'parent_id' => $expensesGroup->id,
                'description' => 'Funds set aside for potential liabilities or losses',
                'is_group' => true,
            ]);

            LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5301',
                'name' => 'Provision For Loan Losses',
                'type' => 'expense',
                'parent_id' => $provisionsGroup->id,
                'description' => 'Estimated losses from bad loans',
            ]);

            // ----------------------------
            // NON-OPERATING / OTHER EXPENSES (5400)
            // ----------------------------
            $otherExpensesGroup = LedgerAccount::create([
                'organization_id' => $organizationGroup->id,
                'code' => '5400',
                'name' => 'Other Expenses',
                'type' => 'expense',
                'parent_id' => $expensesGroup->id,
                'description' => 'Non-core or one-off expenses',
                'is_group' => true,
            ]);

            LedgerAccount::insert([
                ['organization_id' => $organizationGroup->id, 'code' => '5401', 'name' => 'Loss on Sale of Assets', 'type' => 'expense', 'parent_id' => $otherExpensesGroup->id, 'description' => 'Loss incurred on asset disposals'],
                ['organization_id' => $organizationGroup->id, 'code' => '5402', 'name' => 'Write-Offs / Bad Debts', 'type' => 'expense', 'parent_id' => $otherExpensesGroup->id, 'description' => 'Unrecoverable debts or write-offs'],
                ['organization_id' => $organizationGroup->id, 'code' => '5403', 'name' => 'Fines & Penalties', 'type' => 'expense', 'parent_id' => $otherExpensesGroup->id, 'description' => 'Legal fines or regulatory penalties'],
            ]);

            $this->command->info('✅ full Banking-Grade COA Seeded Successfully!');
        });
    }
}