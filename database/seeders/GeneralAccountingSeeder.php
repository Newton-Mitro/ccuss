<?php

namespace Database\Seeders;

use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\BudgetEntry;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GeneralAccountingSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $user = User::query()->where('email', 'super.admin@email.com')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');

        DB::transaction(function () use ($organization, $user, $branchId) {
            $groups = [];

            foreach ([
                ['1000', 'Assets', 'ASSET', 'DEBIT', null],
                ['1100', 'Cash and Bank', 'ASSET', 'DEBIT', '1000'],
                ['1200', 'Loan Receivables', 'ASSET', 'DEBIT', '1000'],
                ['1300', 'Other Receivables', 'ASSET', 'DEBIT', '1000'],
                ['2000', 'Liabilities', 'LIABILITY', 'CREDIT', null],
                ['2100', 'Member Deposits', 'LIABILITY', 'CREDIT', '2000'],
                ['2200', 'Other Liabilities', 'LIABILITY', 'CREDIT', '2000'],
                ['3000', 'Equity', 'EQUITY', 'CREDIT', null],
                ['3100', 'Member Equity', 'EQUITY', 'CREDIT', '3000'],
                ['4000', 'Income', 'INCOME', 'CREDIT', null],
                ['4100', 'Interest Income', 'INCOME', 'CREDIT', '4000'],
                ['4200', 'Fee and Other Income', 'INCOME', 'CREDIT', '4000'],
                ['5000', 'Expenses', 'EXPENSE', 'DEBIT', null],
                ['5100', 'Operating Expenses', 'EXPENSE', 'DEBIT', '5000'],
                ['5200', 'Member Interest Expense', 'EXPENSE', 'DEBIT', '5000'],
            ] as [$code, $name, $type, $normalBalance, $parentCode]) {
                $groups[$code] = AccountGroup::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $code,
                    ],
                    [
                        'parent_id' => $parentCode ? $groups[$parentCode]->id : null,
                        'name' => $name,
                        'type' => $type,
                        'normal_balance' => $normalBalance,
                        'level' => $parentCode ? 1 : 0,
                        'is_system' => true,
                        'status' => true,
                    ],
                );
            }

            $accounts = [];
            foreach ([
                ['1100', 'Cash on Hand', '1100', 'ASSET', 'DEBIT', true, true, false],
                ['1110', 'Vault Cash', '1100', 'ASSET', 'DEBIT', true, true, false],
                ['1120', 'Teller Cash', '1100', 'ASSET', 'DEBIT', true, true, false],
                ['1130', 'Petty Cash', '1100', 'ASSET', 'DEBIT', true, true, false],
                ['1200', 'Bank Accounts', '1100', 'ASSET', 'DEBIT', true, true, false],
                ['1210', 'Bank Clearing', '1100', 'ASSET', 'DEBIT', false, true, false],
                ['1300', 'Loan Receivables', '1200', 'ASSET', 'DEBIT', false, false, true],
                ['1310', 'Accrued Loan Interest Receivable', '1200', 'ASSET', 'DEBIT', false, false, false],
                ['1320', 'Loan Loss Allowance', '1200', 'ASSET', 'CREDIT', false, false, false],
                ['1400', 'Other Receivables', '1300', 'ASSET', 'DEBIT', false, false, false],
                ['2100', 'Savings Deposits', '2100', 'LIABILITY', 'CREDIT', false, false, true],
                ['2200', 'Fixed Deposits', '2100', 'LIABILITY', 'CREDIT', false, false, true],
                ['2300', 'Recurring Deposits', '2100', 'LIABILITY', 'CREDIT', false, false, true],
                ['2400', 'Member Dividend Payable', '2200', 'LIABILITY', 'CREDIT', false, false, false],
                ['2500', 'Accrued Operating Payables', '2200', 'LIABILITY', 'CREDIT', false, false, false],
                ['3100', 'Share Capital', '3100', 'EQUITY', 'CREDIT', false, false, true],
                ['3200', 'Statutory Reserve', '3100', 'EQUITY', 'CREDIT', false, false, false],
                ['3300', 'Retained Earnings', '3000', 'EQUITY', 'CREDIT', false, false, false],
                ['4100', 'Loan Interest Income', '4100', 'INCOME', 'CREDIT', false, false, false],
                ['4110', 'Investment Interest Income', '4100', 'INCOME', 'CREDIT', false, false, false],
                ['4200', 'Service and Account Fee Income', '4200', 'INCOME', 'CREDIT', false, false, false],
                ['4210', 'Loan Processing Fee Income', '4200', 'INCOME', 'CREDIT', false, false, false],
                ['4300', 'Other Operating Income', '4000', 'INCOME', 'CREDIT', false, false, false],
                ['5100', 'Operating Expense', '5100', 'EXPENSE', 'DEBIT', false, false, false],
                ['5110', 'Staff Cost', '5100', 'EXPENSE', 'DEBIT', false, false, false],
                ['5120', 'Administrative Expense', '5100', 'EXPENSE', 'DEBIT', false, false, false],
                ['5200', 'Member Interest Expense', '5200', 'EXPENSE', 'DEBIT', false, false, false],
                ['5210', 'Share Dividend Expense', '5200', 'EXPENSE', 'DEBIT', false, false, false],
                ['5220', 'Loan Loss Provision Expense', '5100', 'EXPENSE', 'DEBIT', false, false, false],
            ] as [$code, $name, $groupCode, $type, $normalBalance, $isCash, $isReconcilable, $isControl]) {
                $accounts[$code] = LedgerAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $code,
                    ],
                    [
                        'account_group_id' => $groups[$groupCode]->id,
                        'name' => $name,
                        'type' => $type,
                        'normal_balance' => $normalBalance,
                        'level' => 0,
                        'is_control_account' => $isControl,
                        'is_reconcilable' => $isReconcilable,
                        'is_cash_account' => $isCash,
                        'is_system' => true,
                        'status' => true,
                    ],
                );
            }

            $operations = CostCenter::query()->firstOrCreate(
                ['organization_id' => $organization->id, 'code' => 'CC-OPS'],
                ['name' => 'Operations', 'level' => 0, 'status' => true],
            );

            foreach ([
                ['CC-FIN', 'Finance'],
                ['CC-HR', 'Human Resources'],
                ['CC-IT', 'Information Technology'],
            ] as [$code, $name]) {
                CostCenter::query()->firstOrCreate(
                    ['organization_id' => $organization->id, 'code' => $code],
                    [
                        'parent_id' => $operations->id,
                        'name' => $name,
                        'level' => 1,
                        'status' => true,
                    ],
                );
            }

            $fiscalYear = FiscalYear::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'name' => '2025-2026',
                ],
                [
                    'start_date' => '2025-07-01',
                    'end_date' => '2026-06-30',
                    'status' => 'OPEN',
                    'is_current' => true,
                ],
            );

            $periodStart = CarbonImmutable::parse('2025-07-01');
            for ($month = 0; $month < 12; $month++) {
                $start = $periodStart->addMonths($month);
                $end = $start->endOfMonth();
                $fiscalYear->periods()->firstOrCreate(
                    ['name' => $start->format('F Y')],
                    [
                        'start_date' => $start->toDateString(),
                        'end_date' => $end->toDateString(),
                        'status' => 'OPEN',
                    ],
                );
            }

            $period = $fiscalYear->periods()->where('name', 'July 2025')->firstOrFail();

            $budget = Budget::query()->firstOrCreate(
                [
                    'organization_id' => $organization->id,
                    'fiscal_year_id' => $fiscalYear->id,
                    'name' => 'Operating Budget 2025-2026',
                ],
                ['status' => 'ACTIVE'],
            );

            foreach ([
                [$accounts['5100']->id, $operations->id, $period->id, 25000],
                [$accounts['5100']->id, null, null, 120000],
                [$accounts['4100']->id, null, $period->id, 500000],
            ] as [$accountId, $costCenterId, $periodId, $amount]) {
                BudgetEntry::query()->firstOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'budget_id' => $budget->id,
                        'account_id' => $accountId,
                        'cost_center_id' => $costCenterId,
                        'fiscal_period_id' => $periodId,
                    ],
                    ['amount' => $amount],
                );
            }

            if (
                !Voucher::query()
                    ->where('organization_id', $organization->id)
                    ->where('description', 'Opening balances')
                    ->where('status', 'POSTED')
                    ->exists()
            ) {
                $voucher = app(VoucherService::class)->createDraft([
                    'branch_id' => $branchId,
                    'fiscal_period_id' => $period->id,
                    'voucher_type' => 'OPENING',
                    'voucher_date' => '2025-07-01',
                    'description' => 'Opening balances',
                    'entries' => [
                        [
                            'account_id' => $accounts['1100']->id,
                            'debit' => 100000,
                            'credit' => 0,
                        ],
                        [
                            'account_id' => $accounts['3100']->id,
                            'debit' => 0,
                            'credit' => 100000,
                        ],
                    ],
                ], $organization->id, $user->id);

                app(VoucherService::class)->post($voucher, $organization->id, $user->id);
            }
        });

        $this->command?->info('General Accounting data seeded.');
    }
}
