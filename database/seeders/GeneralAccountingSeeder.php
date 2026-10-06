<?php

namespace Database\Seeders;

use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\BudgetEntry;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GeneralAccountingSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        DB::transaction(function () use ($organization): void {
            /*
            |--------------------------------------------------------------------------
            | 1. Account Groups
            |--------------------------------------------------------------------------
            */

            $accountGroups = $this->seedAccountGroups($organization);

            /*
            |--------------------------------------------------------------------------
            | 2. Ledger Accounts
            |--------------------------------------------------------------------------
            */

            $ledgerAccounts = $this->seedLedgerAccounts(
                $organization,
                $accountGroups,
            );

            /*
            |--------------------------------------------------------------------------
            | 3. Cost Centers
            |--------------------------------------------------------------------------
            */

            $costCenters = $this->seedCostCenters($organization);

            /*
            |--------------------------------------------------------------------------
            | 4. Fiscal Years & Periods
            |--------------------------------------------------------------------------
            */

            $fiscalYears = $this->seedFiscalYears($organization);

            /*
            |--------------------------------------------------------------------------
            | 5. Opening Budget
            |--------------------------------------------------------------------------
            */

            $this->seedOpeningBudget(
                $organization,
                $ledgerAccounts,
                $costCenters,
                $fiscalYears,
            );
        });

        $this->command?->info(
            'General Accounting data seeded.',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Account Groups
    |--------------------------------------------------------------------------
    */

    private function seedAccountGroups(
        Organization $organization,
    ): array {
        $groups = [];

        $definitions = [
            /*
            |--------------------------------------------------------------------------
            | Assets
            |--------------------------------------------------------------------------
            */

            [
                'code' => '1000',
                'name' => 'Assets',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'parent' => null,
            ],
            [
                'code' => '1100',
                'name' => 'Cash and Bank',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'parent' => '1000',
            ],
            [
                'code' => '1200',
                'name' => 'Loan Receivables',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'parent' => '1000',
            ],
            [
                'code' => '1300',
                'name' => 'Other Receivables',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'parent' => '1000',
            ],

            /*
            |--------------------------------------------------------------------------
            | Liabilities
            |--------------------------------------------------------------------------
            */

            [
                'code' => '2000',
                'name' => 'Liabilities',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'parent' => null,
            ],
            [
                'code' => '2100',
                'name' => 'Member Deposits',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'parent' => '2000',
            ],
            [
                'code' => '2200',
                'name' => 'Other Liabilities',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'parent' => '2000',
            ],

            /*
            |--------------------------------------------------------------------------
            | Equity
            |--------------------------------------------------------------------------
            */

            [
                'code' => '3000',
                'name' => 'Equity',
                'type' => 'EQUITY',
                'normal_balance' => 'CREDIT',
                'parent' => null,
            ],
            [
                'code' => '3100',
                'name' => 'Member Equity',
                'type' => 'EQUITY',
                'normal_balance' => 'CREDIT',
                'parent' => '3000',
            ],

            /*
            |--------------------------------------------------------------------------
            | Income
            |--------------------------------------------------------------------------
            */

            [
                'code' => '4000',
                'name' => 'Income',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'parent' => null,
            ],
            [
                'code' => '4100',
                'name' => 'Interest Income',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'parent' => '4000',
            ],
            [
                'code' => '4200',
                'name' => 'Fee and Other Income',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'parent' => '4000',
            ],

            /*
            |--------------------------------------------------------------------------
            | Expenses
            |--------------------------------------------------------------------------
            */

            [
                'code' => '5000',
                'name' => 'Expenses',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'parent' => null,
            ],
            [
                'code' => '5100',
                'name' => 'Operating Expenses',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'parent' => '5000',
            ],
            [
                'code' => '5200',
                'name' => 'Member Interest Expense',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'parent' => '5000',
            ],
        ];

        foreach ($definitions as $definition) {
            $parentCode = $definition['parent'];

            $groups[$definition['code']] =
                AccountGroup::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $definition['code'],
                    ],
                    [
                        'parent_id' => $parentCode
                            ? $groups[$parentCode]->id
                            : null,

                        'name' => $definition['name'],
                        'type' => $definition['type'],
                        'normal_balance' =>
                            $definition['normal_balance'],

                        'level' => $parentCode ? 1 : 0,

                        'is_system' => true,
                        'status' => true,
                    ],
                );
        }

        return $groups;
    }

    /*
    |--------------------------------------------------------------------------
    | Ledger Accounts
    |--------------------------------------------------------------------------
    */

    private function seedLedgerAccounts(
        Organization $organization,
        array $groups,
    ): array {
        $accounts = [];

        $definitions = [
            /*
            |--------------------------------------------------------------------------
            | Assets
            |--------------------------------------------------------------------------
            */

            [
                'code' => '1100',
                'name' => 'Cash on Hand',
                'group' => '1100',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => true,
                'is_reconcilable' => true,
                'is_control' => false,
            ],
            [
                'code' => '1110',
                'name' => 'Vault Cash',
                'group' => '1100',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => true,
                'is_reconcilable' => true,
                'is_control' => true,
            ],
            [
                'code' => '1120',
                'name' => 'Teller Cash',
                'group' => '1100',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => true,
                'is_reconcilable' => true,
                'is_control' => true,
            ],
            [
                'code' => '1130',
                'name' => 'Petty Cash',
                'group' => '1100',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => true,
                'is_reconcilable' => true,
                'is_control' => true,
            ],
            [
                'code' => '1200',
                'name' => 'Bank Accounts',
                'group' => '1100',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => true,
                'is_reconcilable' => true,
                'is_control' => true,
            ],
            [
                'code' => '1210',
                'name' => 'Bank Clearing',
                'group' => '1100',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => true,
                'is_control' => false,
            ],
            [
                'code' => '1300',
                'name' => 'Loan Receivables',
                'group' => '1200',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => true,
            ],
            [
                'code' => '1310',
                'name' => 'Accrued Loan Interest Receivable',
                'group' => '1200',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '1320',
                'name' => 'Loan Loss Allowance',
                'group' => '1200',
                'type' => 'ASSET',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '1400',
                'name' => 'Other Receivables',
                'group' => '1300',
                'type' => 'ASSET',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | Liabilities
            |--------------------------------------------------------------------------
            */

            [
                'code' => '2100',
                'name' => 'Savings Deposits',
                'group' => '2100',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => true,
            ],
            [
                'code' => '2200',
                'name' => 'Fixed Deposits',
                'group' => '2100',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => true,
            ],
            [
                'code' => '2300',
                'name' => 'Recurring Deposits',
                'group' => '2100',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => true,
            ],
            [
                'code' => '2400',
                'name' => 'Member Dividend Payable',
                'group' => '2200',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '2500',
                'name' => 'Accrued Operating Payables',
                'group' => '2200',
                'type' => 'LIABILITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | Equity
            |--------------------------------------------------------------------------
            */

            [
                'code' => '3100',
                'name' => 'Share Capital',
                'group' => '3100',
                'type' => 'EQUITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => true,
            ],
            [
                'code' => '3200',
                'name' => 'Statutory Reserve',
                'group' => '3100',
                'type' => 'EQUITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '3300',
                'name' => 'Retained Earnings',
                'group' => '3000',
                'type' => 'EQUITY',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | Income
            |--------------------------------------------------------------------------
            */

            [
                'code' => '4100',
                'name' => 'Loan Interest Income',
                'group' => '4100',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '4110',
                'name' => 'Investment Interest Income',
                'group' => '4100',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '4200',
                'name' => 'Service and Account Fee Income',
                'group' => '4200',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '4210',
                'name' => 'Loan Processing Fee Income',
                'group' => '4200',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '4300',
                'name' => 'Other Operating Income',
                'group' => '4000',
                'type' => 'INCOME',
                'normal_balance' => 'CREDIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | Expenses
            |--------------------------------------------------------------------------
            */

            [
                'code' => '5100',
                'name' => 'Operating Expense',
                'group' => '5100',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '5110',
                'name' => 'Staff Cost',
                'group' => '5100',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '5120',
                'name' => 'Administrative Expense',
                'group' => '5100',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '5200',
                'name' => 'Member Interest Expense',
                'group' => '5200',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '5210',
                'name' => 'Share Dividend Expense',
                'group' => '5200',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
            [
                'code' => '5220',
                'name' => 'Loan Loss Provision Expense',
                'group' => '5100',
                'type' => 'EXPENSE',
                'normal_balance' => 'DEBIT',
                'is_cash' => false,
                'is_reconcilable' => false,
                'is_control' => false,
            ],
        ];

        foreach ($definitions as $definition) {
            $accounts[$definition['code']] =
                LedgerAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $definition['code'],
                    ],
                    [
                        'account_group_id' =>
                            $groups[$definition['group']]->id,

                        'name' => $definition['name'],
                        'type' => $definition['type'],
                        'normal_balance' =>
                            $definition['normal_balance'],

                        'level' => 0,

                        'is_control_account' =>
                            $definition['is_control'],

                        'is_reconcilable' =>
                            $definition['is_reconcilable'],

                        'is_cash_account' =>
                            $definition['is_cash'],

                        'is_system' => true,
                        'status' => true,
                    ],
                );
        }

        return $accounts;
    }

    /*
    |--------------------------------------------------------------------------
    | Cost Centers
    |--------------------------------------------------------------------------
    */

    private function seedCostCenters(
        Organization $organization,
    ): array {
        $operations = CostCenter::query()->firstOrCreate(
            [
                'organization_id' => $organization->id,
                'code' => 'CC-OPS',
            ],
            [
                'name' => 'Operations',
                'level' => 0,
                'status' => true,
            ],
        );

        $costCenters = [
            'operations' => $operations,
        ];

        foreach (
            [
                [
                    'code' => 'CC-FIN',
                    'name' => 'Finance',
                ],
                [
                    'code' => 'CC-HR',
                    'name' => 'Human Resources',
                ],
                [
                    'code' => 'CC-IT',
                    'name' => 'Information Technology',
                ],
            ] as $definition
        ) {
            $costCenters[$definition['code']] =
                CostCenter::query()->firstOrCreate(
                    [
                        'organization_id' =>
                            $organization->id,

                        'code' => $definition['code'],
                    ],
                    [
                        'parent_id' => $operations->id,
                        'name' => $definition['name'],
                        'level' => 1,
                        'status' => true,
                    ],
                );
        }

        return $costCenters;
    }

    /*
    |--------------------------------------------------------------------------
    | Fiscal Years & Periods
    |--------------------------------------------------------------------------
    */

    private function seedFiscalYears(
        Organization $organization,
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Opening Fiscal Year
        |--------------------------------------------------------------------------
        */

        $openingFiscalYearStart =
            CarbonImmutable::parse('2025-07-01');

        /*
        |--------------------------------------------------------------------------
        | Current Fiscal Year
        |--------------------------------------------------------------------------
        |
        | Financial year starts on July 1 and ends on June 30.
        |
        */

        $currentFiscalYearStart =
            CarbonImmutable::now()->month >= 7
            ? CarbonImmutable::now()
                ->startOfYear()
                ->addMonths(6)
            : CarbonImmutable::now()
                ->subYear()
                ->startOfYear()
                ->addMonths(6);

        $currentFiscalYearEnd =
            $currentFiscalYearStart
                ->addYear()
                ->subDay();

        $openingFiscalYearIsCurrent =
            $currentFiscalYearStart->equalTo(
                $openingFiscalYearStart,
            );

        /*
        |--------------------------------------------------------------------------
        | 2025-2026 Fiscal Year
        |--------------------------------------------------------------------------
        */

        $fiscalYear =
            FiscalYear::query()->updateOrCreate(
                [
                    'organization_id' =>
                        $organization->id,

                    'name' => '2025-2026',
                ],
                [
                    'start_date' => '2025-07-01',
                    'end_date' => '2026-06-30',

                    'status' => 'OPEN',
                    'is_current' =>
                        $openingFiscalYearIsCurrent,
                ],
            );

        $this->seedFiscalPeriods(
            $fiscalYear,
            $openingFiscalYearStart,
        );

        /*
        |--------------------------------------------------------------------------
        | Current Fiscal Year
        |--------------------------------------------------------------------------
        */

        $currentFiscalYear =
            FiscalYear::query()->updateOrCreate(
                [
                    'organization_id' =>
                        $organization->id,

                    'name' =>
                        $currentFiscalYearStart->year .
                        '-' .
                        $currentFiscalYearEnd->year,
                ],
                [
                    'start_date' =>
                        $currentFiscalYearStart
                            ->toDateString(),

                    'end_date' =>
                        $currentFiscalYearEnd
                            ->toDateString(),

                    'status' => 'OPEN',
                    'is_current' => true,
                ],
            );

        $this->seedFiscalPeriods(
            $currentFiscalYear,
            $currentFiscalYearStart,
        );

        return [
            'opening' => $fiscalYear,
            'current' => $currentFiscalYear,
        ];
    }

    private function seedFiscalPeriods(
        FiscalYear $fiscalYear,
        CarbonImmutable $startDate,
    ): void {
        for ($month = 0; $month < 12; $month++) {
            $start = $startDate->addMonths($month);
            $end = $start->endOfMonth();

            $fiscalYear->periods()->firstOrCreate(
                [
                    'name' => $start->format('F Y'),
                ],
                [
                    'start_date' =>
                        $start->toDateString(),

                    'end_date' =>
                        $end->toDateString(),

                    'status' => 'OPEN',
                ],
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Opening Budget
    |--------------------------------------------------------------------------
    */

    private function seedOpeningBudget(
        Organization $organization,
        array $ledgerAccounts,
        array $costCenters,
        array $fiscalYears,
    ): void {
        $openingFiscalYear = $fiscalYears['opening'];

        $period = $openingFiscalYear
            ->periods()
            ->where('name', 'July 2025')
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Budget
        |--------------------------------------------------------------------------
        */

        $budget = Budget::query()->firstOrCreate(
            [
                'organization_id' =>
                    $organization->id,

                'fiscal_year_id' =>
                    $openingFiscalYear->id,

                'name' =>
                    'Operating Budget 2025-2026',
            ],
            [
                'status' => 'ACTIVE',
            ],
        );

        /*
        |--------------------------------------------------------------------------
        | Budget Entries
        |--------------------------------------------------------------------------
        */

        $entries = [
            [
                'account_id' =>
                    $ledgerAccounts['5100']->id,

                'cost_center_id' =>
                    $costCenters['operations']->id,

                'fiscal_period_id' =>
                    $period->id,

                'amount' => 0,
            ],
            [
                'account_id' =>
                    $ledgerAccounts['5100']->id,

                'cost_center_id' => null,
                'fiscal_period_id' => null,

                'amount' => 0,
            ],
            [
                'account_id' =>
                    $ledgerAccounts['4100']->id,

                'cost_center_id' => null,

                'fiscal_period_id' =>
                    $period->id,

                'amount' => 0,
            ],
        ];

        foreach ($entries as $entry) {
            BudgetEntry::query()->firstOrCreate(
                [
                    'organization_id' =>
                        $organization->id,

                    'budget_id' => $budget->id,

                    'account_id' =>
                        $entry['account_id'],

                    'cost_center_id' =>
                        $entry['cost_center_id'],

                    'fiscal_period_id' =>
                        $entry['fiscal_period_id'],
                ],
                [
                    'amount' => $entry['amount'],
                ],
            );
        }
    }
}
