<?php

namespace Database\Seeders;

use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\AccountGroup;
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
        $organization = Organization::query()->where('code', 'ORG001')->firstOrFail();
        $user = User::query()->where('email', 'super.admin@email.com')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');

        DB::transaction(function () use ($organization, $user, $branchId) {
            $groups = [];

            foreach ([
                ['1000', 'Assets', 'ASSET', 'DEBIT'],
                ['2000', 'Liabilities', 'LIABILITY', 'CREDIT'],
                ['3000', 'Equity', 'EQUITY', 'CREDIT'],
                ['4000', 'Income', 'INCOME', 'CREDIT'],
                ['5000', 'Expenses', 'EXPENSE', 'DEBIT'],
            ] as [$code, $name, $type, $normalBalance]) {
                $groups[$code] = AccountGroup::query()->firstOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $code,
                    ],
                    [
                        'name' => $name,
                        'type' => $type,
                        'normal_balance' => $normalBalance,
                        'level' => 0,
                        'is_system' => true,
                        'status' => true,
                    ],
                );
            }

            $accounts = [];
            foreach ([
                ['1100', 'Cash on Hand', '1000', 'ASSET', 'DEBIT', true],
                ['1200', 'Bank Account', '1000', 'ASSET', 'DEBIT', true],
                ['2100', 'Accounts Payable', '2000', 'LIABILITY', 'CREDIT', false],
                ['3100', 'Retained Earnings', '3000', 'EQUITY', 'CREDIT', false],
                ['4100', 'Service Income', '4000', 'INCOME', 'CREDIT', false],
                ['5100', 'Operating Expense', '5000', 'EXPENSE', 'DEBIT', false],
            ] as [$code, $name, $groupCode, $type, $normalBalance, $isCash]) {
                $accounts[$code] = LedgerAccount::query()->firstOrCreate(
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
                        'is_control_account' => false,
                        'is_reconcilable' => $isCash,
                        'is_cash_account' => $isCash,
                        'is_system' => true,
                        'status' => true,
                    ],
                );
            }

            $fiscalYear = FiscalYear::query()->firstOrCreate(
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
