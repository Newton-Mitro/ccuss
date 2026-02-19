<?php

namespace Database\Seeders;

use App\Accounting\Models\Account;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    public function run()
    {
        // -----------------------
        // ASSETS
        // -----------------------
        $assets = Account::create([
            'code' => '1000',
            'name' => 'Assets',
            'type' => 'ASSET',
            // 'category' => 'GROUP',
        ]);

        // Sub-groups
        $currentAssets = Account::create([
            'code' => '1100',
            'name' => 'Current Assets',
            'type' => 'ASSET',
            // 'category' => 'GROUP',
            'parent_id' => $assets->id,
        ]);

        $fixedAssets = Account::create([
            'code' => '1200',
            'name' => 'Fixed Assets',
            'type' => 'ASSET',
            // 'category' => 'GROUP',
            'parent_id' => $assets->id,
        ]);

        // GL accounts under Current Assets
        Account::create([
            'code' => '1010',
            'name' => 'Cash',
            'type' => 'ASSET',
            // 'category' => 'GL',
            'parent_id' => $currentAssets->id,
        ]);

        Account::create([
            'code' => '1020',
            'name' => 'Accounts Receivable',
            'type' => 'ASSET',
            // 'category' => 'GL',
            'parent_id' => $currentAssets->id,
        ]);

        Account::create([
            'code' => '1030',
            'name' => 'Investments',
            'type' => 'ASSET',
            // 'category' => 'GL',
            'parent_id' => $currentAssets->id,
        ]);

        // GL accounts under Fixed Assets
        Account::create([
            'code' => '1040',
            'name' => 'Land',
            'type' => 'ASSET',
            // 'category' => 'GL',
            'parent_id' => $fixedAssets->id,
        ]);

        Account::create([
            'code' => '1050',
            'name' => 'Buildings',
            'type' => 'ASSET',
            // 'category' => 'GL',
            'parent_id' => $fixedAssets->id,
        ]);

        Account::create([
            'code' => '1060',
            'name' => 'Machinery',
            'type' => 'ASSET',
            // 'category' => 'GL',
            'parent_id' => $fixedAssets->id,
        ]);

        // -----------------------
        // LIABILITIES
        // -----------------------
        $liabilities = Account::create([
            'code' => '2000',
            'name' => 'Liabilities',
            'type' => 'LIABILITY',
            // 'category' => 'GROUP',
        ]);

        $currentLiabilities = Account::create([
            'code' => '2100',
            'name' => 'Current Liabilities',
            'type' => 'LIABILITY',
            // 'category' => 'GROUP',
            'parent_id' => $liabilities->id,
        ]);

        $longTermLiabilities = Account::create([
            'code' => '2200',
            'name' => 'Long-Term Liabilities',
            'type' => 'LIABILITY',
            // 'category' => 'GROUP',
            'parent_id' => $liabilities->id,
        ]);

        // GL accounts
        Account::create([
            'code' => '2010',
            'name' => 'Member Deposits',
            'type' => 'LIABILITY',
            // 'category' => 'GL',
            'parent_id' => $currentLiabilities->id,
        ]);

        Account::create([
            'code' => '2020',
            'name' => 'Accounts Payable',
            'type' => 'LIABILITY',
            // 'category' => 'GL',
            'parent_id' => $currentLiabilities->id,
        ]);

        Account::create([
            'code' => '2040',
            'name' => 'Loans Payable',
            'type' => 'LIABILITY',
            // 'category' => 'GL',
            'parent_id' => $longTermLiabilities->id,
        ]);

        // -----------------------
        // EQUITY
        // -----------------------
        $equity = Account::create([
            'code' => '3000',
            'name' => 'Equity',
            'type' => 'EQUITY',
            // 'category' => 'GROUP',
        ]);

        $capital = Account::create([
            'code' => '3100',
            'name' => 'Capital',
            'type' => 'EQUITY',
            // 'category' => 'GROUP',
            'parent_id' => $equity->id,
        ]);

        Account::create([
            'code' => '3010',
            'name' => 'Member Shares',
            'type' => 'EQUITY',
            // 'category' => 'GL',
            'parent_id' => $capital->id,
        ]);

        Account::create([
            'code' => '3020',
            'name' => 'Retained Earnings',
            'type' => 'EQUITY',
            // 'category' => 'GL',
            'parent_id' => $capital->id,
        ]);

        Account::create([
            'code' => '3030',
            'name' => 'Reserves',
            'type' => 'EQUITY',
            // 'category' => 'GL',
            'parent_id' => $equity->id,
        ]);

        // -----------------------
        // INCOME
        // -----------------------
        $income = Account::create([
            'code' => '4000',
            'name' => 'Income',
            'type' => 'INCOME',
            // 'category' => 'GROUP',
        ]);

        $interestIncomeGroup = Account::create([
            'code' => '4100',
            'name' => 'Interest Income',
            'type' => 'INCOME',
            // 'category' => 'GROUP',
            'parent_id' => $income->id,
        ]);

        Account::create([
            'code' => '4010',
            'name' => 'Savings Interest',
            'type' => 'INCOME',
            // 'category' => 'GL',
            'parent_id' => $interestIncomeGroup->id,
        ]);

        Account::create([
            'code' => '4020',
            'name' => 'Loan Interest',
            'type' => 'INCOME',
            // 'category' => 'GL',
            'parent_id' => $interestIncomeGroup->id,
        ]);

        // -----------------------
        // EXPENSES
        // -----------------------
        $expenses = Account::create([
            'code' => '5000',
            'name' => 'Expenses',
            'type' => 'EXPENSE',
            // 'category' => 'GROUP',
        ]);

        $operatingExpenses = Account::create([
            'code' => '5100',
            'name' => 'Operating Expenses',
            'type' => 'EXPENSE',
            // 'category' => 'GROUP',
            'parent_id' => $expenses->id,
        ]);

        Account::create([
            'code' => '5020',
            'name' => 'Salaries & Wages',
            'type' => 'EXPENSE',
            // 'category' => 'GL',
            'parent_id' => $operatingExpenses->id,
        ]);

        Account::create([
            'code' => '5030',
            'name' => 'Office Expenses',
            'type' => 'EXPENSE',
            // 'category' => 'GL',
            'parent_id' => $operatingExpenses->id,
        ]);

        Account::create([
            'code' => '5040',
            'name' => 'Depreciation',
            'type' => 'EXPENSE',
            // 'category' => 'GL',
            'parent_id' => $expenses->id,
        ]);

        Account::create([
            'code' => '5050',
            'name' => 'Provision for Loan Losses',
            'type' => 'EXPENSE',
            // 'category' => 'GL',
            'parent_id' => $expenses->id,
        ]);
    }
}
