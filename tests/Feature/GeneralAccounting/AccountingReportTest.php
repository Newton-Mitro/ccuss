<?php

use App\GeneralAccounting\Application\AccountingReportService;
use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\VoucherService;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function reportFixture(): array
{
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);
    $group = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    $bank = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1200',
        'name' => 'Bank',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);

    return compact('organization', 'user', 'fiscalYear', 'period', 'cash', 'bank');
}

function grantReportPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'accounting_reports_test'],
        ['name' => 'Accounting Reports Test'],
    );
    $permission = Permission::updateOrCreate(
        ['slug' => 'accounting.reports.view'],
        [
            'module' => 'accounting_reports',
            'name' => 'View Reports',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('loads the general ledger report through its HTTP route', function () {
    $fixture = reportFixture();
    grantReportPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('financial-reports.general-ledger'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('general-accounting/reports/general-ledger-page'));
});

it('redirects unauthenticated users from the general ledger report to login', function () {
    $this->get(route('financial-reports.general-ledger'))
        ->assertRedirect(route('login'));
});

it('redirects users without an active organization to organization selection', function () {
    $fixture = reportFixture();
    grantReportPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->get(route('financial-reports.general-ledger'))
        ->assertRedirect(route('organizations.index'));
});

it('forbids users without report permission from the general ledger report', function () {
    $fixture = reportFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('financial-reports.general-ledger'))
        ->assertForbidden();
});

it('loads the general ledger report when the organization has no active accounts', function () {
    $fixture = reportFixture();
    $fixture['cash']->update(['status' => false]);
    $fixture['bank']->update(['status' => false]);
    grantReportPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('financial-reports.general-ledger'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('general-accounting/reports/general-ledger-page'));
});

it('loads every financial report route for an authorized organization user', function () {
    $fixture = reportFixture();
    grantReportPermission($fixture['user']);
    $routes = [
        'financial-reports.trial-balance',
        'financial-reports.general-ledger',
        'financial-reports.profit-loss',
        'financial-reports.balance-sheet',
        'financial-reports.cash-flow',
        'financial-reports.shareholders-equity',
    ];

    foreach ($routes as $routeName) {
        $query = ['fiscal_period_id' => $fixture['period']->id];
        if ($routeName === 'financial-reports.general-ledger') {
            $query['account_id'] = $fixture['cash']->id;
        }

        $this->actingAs($fixture['user'])
            ->withSession(['active_organization_id' => $fixture['organization']->id])
            ->get(route($routeName, $query))
            ->assertSuccessful();
    }
});

it('builds trial balance from posted vouchers and excludes drafts', function () {
    $fixture = reportFixture();
    $voucherService = app(VoucherService::class);
    $data = [
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $fixture['cash']->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['bank']->id, 'debit' => 0, 'credit' => 100],
        ],
    ];

    $draft = $voucherService->createDraft($data, $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($draft, $fixture['organization']->id, $fixture['user']->id);
    $voucherService->createDraft(array_merge($data, ['voucher_date' => '2025-07-11']), $fixture['organization']->id, $fixture['user']->id);

    $rows = app(AccountingReportService::class)->trialBalance(
        $fixture['organization']->id,
        $fixture['period']->id,
    );

    $cash = $rows->firstWhere('id', $fixture['cash']->id);
    $bank = $rows->firstWhere('id', $fixture['bank']->id);

    expect($cash->debit)->toBe(100.0)
        ->and($cash->credit)->toBe(0.0)
        ->and($cash->balance)->toBe(100.0)
        ->and($bank->credit)->toBe(100.0)
        ->and($bank->balance)->toBe(-100.0);
});

it('builds a general ledger with a running normal balance', function () {
    $fixture = reportFixture();
    $voucherService = app(VoucherService::class);

    foreach ([100, 40] as $amount) {
        $voucher = $voucherService->createDraft([
            'fiscal_period_id' => $fixture['period']->id,
            'voucher_type' => 'JOURNAL',
            'voucher_date' => '2025-07-10',
            'entries' => [
                ['account_id' => $fixture['cash']->id, 'debit' => $amount, 'credit' => 0],
                ['account_id' => $fixture['bank']->id, 'debit' => 0, 'credit' => $amount],
            ],
        ], $fixture['organization']->id, $fixture['user']->id);
        $voucherService->post($voucher, $fixture['organization']->id, $fixture['user']->id);
    }

    $entries = app(AccountingReportService::class)->generalLedger(
        $fixture['organization']->id,
        $fixture['cash']->id,
        $fixture['period']->id,
    );

    expect($entries)->toHaveCount(2)
        ->and($entries[0]->running_balance)->toBe(100.0)
        ->and($entries[1]->running_balance)->toBe(140.0);
});

it('builds profit and loss and balance sheet statements from posted entries', function () {
    $fixture = reportFixture();
    $createAccount = function (string $type, string $normalBalance, string $code, string $name) use ($fixture) {
        $group = app(AccountGroupService::class)->create([
            'organization_id' => $fixture['organization']->id,
            'code' => $code,
            'name' => $name . ' Group',
            'type' => $type,
            'normal_balance' => $normalBalance,
        ]);

        return app(LedgerAccountService::class)->create([
            'organization_id' => $fixture['organization']->id,
            'account_group_id' => $group->id,
            'code' => $code . '1',
            'name' => $name,
            'type' => $type,
            'normal_balance' => $normalBalance,
            'status' => true,
        ]);
    };

    $income = $createAccount('INCOME', 'CREDIT', '4000', 'Service Income');
    $expense = $createAccount('EXPENSE', 'DEBIT', '5000', 'Operating Expense');
    $liability = $createAccount('LIABILITY', 'CREDIT', '2000', 'Payable');
    $equity = $createAccount('EQUITY', 'CREDIT', '3000', 'Share Capital');
    $voucherService = app(VoucherService::class);

    $voucher = $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $fixture['cash']->id, 'debit' => 500, 'credit' => 0],
            ['account_id' => $income->id, 'debit' => 0, 'credit' => 500],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($voucher, $fixture['organization']->id, $fixture['user']->id);

    $voucher = $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-11',
        'entries' => [
            ['account_id' => $expense->id, 'debit' => 200, 'credit' => 0],
            ['account_id' => $fixture['cash']->id, 'debit' => 0, 'credit' => 200],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($voucher, $fixture['organization']->id, $fixture['user']->id);

    $voucher = $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-12',
        'entries' => [
            ['account_id' => $fixture['cash']->id, 'debit' => 200, 'credit' => 0],
            ['account_id' => $liability->id, 'debit' => 0, 'credit' => 100],
            ['account_id' => $equity->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($voucher, $fixture['organization']->id, $fixture['user']->id);

    $service = app(AccountingReportService::class);
    $profitAndLoss = $service->profitAndLoss($fixture['organization']->id, $fixture['period']->id);
    $balanceSheet = $service->balanceSheet($fixture['organization']->id, $fixture['period']->id);

    expect($profitAndLoss['total_income'])->toBe(500.0)
        ->and($profitAndLoss['total_expenses'])->toBe(200.0)
        ->and($profitAndLoss['net_income'])->toBe(300.0)
        ->and($balanceSheet['total_assets'])->toBe(500.0)
        ->and($balanceSheet['total_liabilities'])->toBe(100.0)
        ->and($balanceSheet['total_equity'])->toBe(100.0)
        ->and($balanceSheet['total_liabilities_and_equity'])->toBe(500.0);
});

it('builds cash flow and shareholders equity statements from posted cash and equity activity', function () {
    $fixture = reportFixture();
    $voucherService = app(VoucherService::class);
    $service = app(AccountingReportService::class);

    $cashAccount = $fixture['cash'];
    $cashAccount->update(['is_cash_account' => true]);

    $incomeGroup = app(AccountGroupService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'code' => '4000',
        'name' => 'Revenue',
        'type' => 'INCOME',
        'normal_balance' => 'CREDIT',
    ]);
    $income = app(LedgerAccountService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $incomeGroup->id,
        'code' => '4001',
        'name' => 'Sales Revenue',
        'type' => 'INCOME',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $equity = app(LedgerAccountService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3001',
        'name' => 'Share Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $cashAccount->id, 'debit' => 500, 'credit' => 0],
            ['account_id' => $income->id, 'debit' => 0, 'credit' => 500],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);

    $capitalVoucher = $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-11',
        'entries' => [
            ['account_id' => $cashAccount->id, 'debit' => 250, 'credit' => 0],
            ['account_id' => $equity->id, 'debit' => 0, 'credit' => 250],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($capitalVoucher, $fixture['organization']->id, $fixture['user']->id);

    $revenueVoucher = $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $cashAccount->id, 'debit' => 500, 'credit' => 0],
            ['account_id' => $income->id, 'debit' => 0, 'credit' => 500],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($revenueVoucher, $fixture['organization']->id, $fixture['user']->id);

    $cashFlow = $service->cashFlowStatement($fixture['organization']->id, $fixture['period']->id);
    $equityStatement = $service->shareholdersEquity($fixture['organization']->id, $fixture['period']->id);

    expect($cashFlow)->toHaveCount(2)
        ->and($cashFlow[0]->cash_category)->toBe('Operating')
        ->and($cashFlow[0]->net_cash)->toBe(500.0)
        ->and($cashFlow[1]->cash_category)->toBe('Financing')
        ->and($cashFlow[1]->net_cash)->toBe(250.0)
        ->and($equityStatement[0]->account_name)->toBe('Share Capital')
        ->and($equityStatement[0]->ending_balance)->toBe(250.0);
});

it('carries prior posted equity activity into the selected period opening balance', function () {
    $fixture = reportFixture();
    $selectedPeriod = app(FiscalPeriodService::class)->create($fixture['fiscalYear'], [
        'name' => 'August 2025',
        'start_date' => '2025-08-01',
        'end_date' => '2025-08-31',
        'status' => 'OPEN',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $equity = app(LedgerAccountService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3001',
        'name' => 'Share Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $voucherService = app(VoucherService::class);

    $priorVoucher = $voucherService->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-15',
        'entries' => [
            ['account_id' => $fixture['cash']->id, 'debit' => 1000, 'credit' => 0],
            ['account_id' => $equity->id, 'debit' => 0, 'credit' => 1000],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherService->post($priorVoucher, $fixture['organization']->id, $fixture['user']->id);

    $statement = app(AccountingReportService::class)->shareholdersEquity(
        $fixture['organization']->id,
        $selectedPeriod->id,
    );

    expect($statement)->toHaveCount(1)
        ->and($statement[0]->opening_balance)->toBe(1000.0)
        ->and($statement[0]->ending_balance)->toBe(1000.0);
});
