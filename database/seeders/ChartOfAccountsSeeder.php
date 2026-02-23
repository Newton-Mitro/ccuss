<?php

namespace Database\Seeders;

use App\Accounting\Models\LedgerAccount;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    public function run()
    {
        /* ===================== ASSETS ===================== */

        $assets = LedgerAccount::create([
            'code' => '1000',
            'name' => 'Assets',
            'type' => 'ASSET',
            'is_control_account' => true,
        ]);

        $currentAssets = LedgerAccount::create([
            'code' => '1100',
            'name' => 'Current Assets',
            'type' => 'ASSET',
            'parent_id' => $assets->id,
            'is_control_account' => true,
        ]);

        $fixedAssets = LedgerAccount::create([
            'code' => '1200',
            'name' => 'Fixed Assets',
            'type' => 'ASSET',
            'parent_id' => $assets->id,
            'is_control_account' => true,
        ]);

        /* ---------- CASH (CONTROL) ---------- */

        $cash = LedgerAccount::create([
            'code' => '1110',
            'name' => 'Cash',
            'type' => 'ASSET',
            'parent_id' => $currentAssets->id,
            'is_control_account' => true,
        ]);

        LedgerAccount::create([
            'code' => '1111',
            'name' => 'Cash in Hand',
            'type' => 'ASSET',
            'parent_id' => $cash->id,
        ]);

        LedgerAccount::create([
            'code' => '1112',
            'name' => 'Cash in Bank',
            'type' => 'ASSET',
            'parent_id' => $cash->id,
        ]);

        LedgerAccount::create([
            'code' => '1113',
            'name' => 'Petty Cash',
            'type' => 'ASSET',
            'parent_id' => $cash->id,
        ]);

        /* ---------- OTHER CURRENT ASSETS ---------- */

        LedgerAccount::create([
            'code' => '1120',
            'name' => 'Accounts Receivable',
            'type' => 'ASSET',
            'parent_id' => $currentAssets->id,
        ]);

        LedgerAccount::create([
            'code' => '1130',
            'name' => 'Investments',
            'type' => 'ASSET',
            'parent_id' => $currentAssets->id,
        ]);

        LedgerAccount::create([
            'code' => '1040',
            'name' => 'Land',
            'type' => 'ASSET',
            'parent_id' => $fixedAssets->id,
        ]);

        LedgerAccount::create([
            'code' => '1050',
            'name' => 'Buildings',
            'type' => 'ASSET',
            'parent_id' => $fixedAssets->id,
        ]);

        LedgerAccount::create([
            'code' => '1060',
            'name' => 'Machinery',
            'type' => 'ASSET',
            'parent_id' => $fixedAssets->id,
        ]);

        /* ===================== LIABILITIES ===================== */

        $liabilities = LedgerAccount::create([
            'code' => '2000',
            'name' => 'Liabilities',
            'type' => 'LIABILITY',
            'is_control_account' => true,
        ]);

        $currentLiabilities = LedgerAccount::create([
            'code' => '2100',
            'name' => 'Current Liabilities',
            'type' => 'LIABILITY',
            'parent_id' => $liabilities->id,
            'is_control_account' => true,
        ]);

        $longTermLiabilities = LedgerAccount::create([
            'code' => '2200',
            'name' => 'Long-Term Liabilities',
            'type' => 'LIABILITY',
            'parent_id' => $liabilities->id,
            'is_control_account' => true,
        ]);

        LedgerAccount::create([
            'code' => '2010',
            'name' => 'Member Deposits',
            'type' => 'LIABILITY',
            'parent_id' => $currentLiabilities->id,
        ]);

        LedgerAccount::create([
            'code' => '2020',
            'name' => 'Accounts Payable',
            'type' => 'LIABILITY',
            'parent_id' => $currentLiabilities->id,
        ]);

        LedgerAccount::create([
            'code' => '2040',
            'name' => 'Loans Payable',
            'type' => 'LIABILITY',
            'parent_id' => $longTermLiabilities->id,
        ]);

        /* ===================== EQUITY ===================== */

        $equity = LedgerAccount::create([
            'code' => '3000',
            'name' => 'Equity',
            'type' => 'EQUITY',
            'is_control_account' => true,
        ]);

        $capital = LedgerAccount::create([
            'code' => '3100',
            'name' => 'Capital',
            'type' => 'EQUITY',
            'parent_id' => $equity->id,
            'is_control_account' => true,
        ]);

        LedgerAccount::create([
            'code' => '3010',
            'name' => 'Member Shares',
            'type' => 'EQUITY',
            'parent_id' => $capital->id,
        ]);

        LedgerAccount::create([
            'code' => '3020',
            'name' => 'Retained Earnings',
            'type' => 'EQUITY',
            'parent_id' => $capital->id,
        ]);

        LedgerAccount::create([
            'code' => '3030',
            'name' => 'Reserves',
            'type' => 'EQUITY',
            'parent_id' => $equity->id,
        ]);

        /* ===================== INCOME ===================== */

        $income = LedgerAccount::create([
            'code' => '4000',
            'name' => 'Income',
            'type' => 'INCOME',
            'is_control_account' => true,
        ]);

        $interestIncome = LedgerAccount::create([
            'code' => '4100',
            'name' => 'Interest Income',
            'type' => 'INCOME',
            'parent_id' => $income->id,
            'is_control_account' => true,
        ]);

        LedgerAccount::create([
            'code' => '4010',
            'name' => 'Savings Interest',
            'type' => 'INCOME',
            'parent_id' => $interestIncome->id,
        ]);

        LedgerAccount::create([
            'code' => '4020',
            'name' => 'Loan Interest',
            'type' => 'INCOME',
            'parent_id' => $interestIncome->id,
        ]);

        /* ===================== EXPENSES ===================== */

        $expenses = LedgerAccount::create([
            'code' => '5000',
            'name' => 'Expenses',
            'type' => 'EXPENSE',
            'is_control_account' => true,
        ]);

        $operatingExpenses = LedgerAccount::create([
            'code' => '5100',
            'name' => 'Operating Expenses',
            'type' => 'EXPENSE',
            'parent_id' => $expenses->id,
            'is_control_account' => true,
        ]);

        LedgerAccount::create([
            'code' => '5020',
            'name' => 'Salaries & Wages',
            'type' => 'EXPENSE',
            'parent_id' => $operatingExpenses->id,
        ]);

        LedgerAccount::create([
            'code' => '5030',
            'name' => 'Office Expenses',
            'type' => 'EXPENSE',
            'parent_id' => $operatingExpenses->id,
        ]);

        LedgerAccount::create([
            'code' => '5040',
            'name' => 'Depreciation',
            'type' => 'EXPENSE',
            'parent_id' => $expenses->id,
        ]);

        LedgerAccount::create([
            'code' => '5050',
            'name' => 'Provision for Loan Losses',
            'type' => 'EXPENSE',
            'parent_id' => $expenses->id,
        ]);
    }
}