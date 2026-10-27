<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\MemberOpeningBalanceImportService;
use App\GeneralAccounting\Application\OpeningBalanceService;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Http\UploadedFile;

function grantOpeningBalanceImportPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'opening_balance_import_test'],
        ['name' => 'Opening Balance Import Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'accounting.opening_balances.create'],
        [
            'module' => 'accounting_opening_balances',
            'name' => 'Create Opening Balances',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('serves the member balance importer and CSV template to authorized users', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    grantOpeningBalanceImportPermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.member-import'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('general-accounting/opening-balances/member-import'));

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.member-import.template'))
        ->assertSuccessful()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

it('forbids users without opening balance create permission from member imports', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.member-import'))
        ->assertForbidden();
});

it('creates a balanced opening balance voucher for the active period', function () {
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

    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);

    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $voucher = app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 2500],
    ], $organization->id, $user->id, $period->id, $capital->id);

    expect($voucher->voucher_type)->toBe('OPENING')
        ->and($voucher->status)->toBe('POSTED')
        ->and($voucher->entries)->toHaveCount(2)
        ->and((float) $voucher->entries->sum('debit'))->toBe(2500.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(2500.0);
});

it('balances opening voucher offsets using only the debit-credit difference', function () {
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
    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $liabilityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '2000',
        'name' => 'Liabilities',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    $savings = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $liabilityGroup->id,
        'code' => '2100',
        'name' => 'Savings Deposits',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $voucher = app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 2500],
        ['account_id' => $savings->id, 'amount' => 1000],
    ], $organization->id, $user->id, $period->id, $capital->id);

    expect($voucher->entries)->toHaveCount(3)
        ->and((float) $voucher->entries->sum('debit'))->toBe(2500.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(2500.0)
        ->and((float) $voucher->entries->firstWhere('account_id', $capital->id)->credit)->toBe(1500.0);
});

it('imports member account balances and posts a balanced opening voucher atomically', function () {
    $organization = Organization::factory()->create(['code' => 'ORG-001']);
    Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $customer = Customer::factory()->create(['organization_id' => $organization->id]);
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
    $liabilityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '2000',
        'name' => 'Liabilities',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $savingsControl = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $liabilityGroup->id,
        'code' => '2100',
        'name' => 'Savings Deposits',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $memberEquity = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3200',
        'name' => 'Member Share Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $savingsAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'SAV-LEGACY-001',
        'account_type' => 'SAVINGS',
        'status' => 'ACTIVE',
    ]);
    $savingsAccount->savingAccount()->create(['minimum_balance' => 0]);
    $shareAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'SHR-LEGACY-001',
        'account_type' => 'SHARE',
        'status' => 'ACTIVE',
    ]);
    $shareAccount->shareAccount()->create([
        'membership_no' => 'MEM-LEGACY-001',
        'membership_status' => 'ACTIVE',
    ]);
    $fixedDepositAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'FDR-LEGACY-001',
        'account_type' => 'FIXED_DEPOSIT',
        'status' => 'ACTIVE',
    ]);
    $fixedDepositAccount->fixedDeposit()->create([
        'principal_amount' => 100,
        'contractual_rate' => 5,
        'term_value' => 12,
        'term_unit' => 'MONTH',
        'started_at' => '2025-01-01',
        'maturity_date' => '2026-01-01',
    ]);
    $recurringDepositAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'RDP-LEGACY-001',
        'account_type' => 'RECURRING_DEPOSIT',
        'status' => 'ACTIVE',
    ]);
    $recurringDepositAccount->recurringDeposit()->create([
        'installment_amount' => 25,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 12,
        'started_at' => '2025-01-01',
        'maturity_date' => '2026-01-01',
    ]);

    expect(fn () => app(MemberOpeningBalanceImportService::class)->import(
        UploadedFile::fake()->createWithContent(
            'invalid-opening.csv',
            "account_no,opening_balance,ledger_account_code\nSAV-LEGACY-001,1250.00,2100\nMISSING-ACCOUNT,50.00,2100\n",
        ),
        $organization->id,
        $user->id,
        $period->id,
        $capital->id,
        '2025-07-10',
    ))->toThrow(InvalidArgumentException::class, 'was not found');

    expect((float) $savingsAccount->fresh()->balance)->toBe(0.0)
        ->and(FinancialTransaction::query()->exists())->toBeFalse();

    $result = app(MemberOpeningBalanceImportService::class)->import(
        UploadedFile::fake()->createWithContent(
            'opening.csv',
            "account_no,opening_balance,ledger_account_code\nSAV-LEGACY-001,1250.00,2100\nSHR-LEGACY-001,250.00,3200\nFDR-LEGACY-001,100.00,2100\nRDP-LEGACY-001,50.00,2100\n",
        ),
        $organization->id,
        $user->id,
        $period->id,
        $capital->id,
        '2025-07-10',
    );

    $savingsAccount->refresh();
    $transaction = FinancialTransaction::query()->where('transaction_type', 'OPENING_BALANCE')->firstOrFail();
    $voucher = $result['voucher']->fresh('entries');

    expect($result['count'])->toBe(4)
        ->and($savingsAccount->status)->toBe('ACTIVE')
        ->and((float) $savingsAccount->balance)->toBe(1250.0)
        ->and((float) $savingsAccount->available_balance)->toBe(1250.0)
        ->and((float) $shareAccount->fresh()->balance)->toBe(250.0)
        ->and($transaction->status)->toBe('POSTED')
        ->and((float) $fixedDepositAccount->fresh()->balance)->toBe(100.0)
        ->and((float) $recurringDepositAccount->fresh()->balance)->toBe(50.0)
        ->and($transaction->entries)->toHaveCount(4)
        ->and($transaction->entries->every(fn ($entry) => $entry->direction === 'CREDIT'))->toBeTrue()
        ->and($voucher->voucher_date->toDateString())->toBe('2025-07-10')
        ->and((float) $voucher->entries->sum('debit'))->toBe(1650.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(1650.0);

    app(FinancialTransactionService::class)->reverse($transaction, $organization->id);

    expect($savingsAccount->fresh()->balance)->toBe('0.0000')
        ->and($shareAccount->fresh()->balance)->toBe('0.0000')
        ->and($fixedDepositAccount->fresh()->balance)->toBe('0.0000')
        ->and($recurringDepositAccount->fresh()->balance)->toBe('0.0000')
        ->and($transaction->fresh()->voucher->status)->toBe('REVERSED');
});

it('requires an offset account when creating opening balances', function () {
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

    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);

    expect(fn () => app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 500],
    ], $organization->id, $user->id, $period->id))->toThrow(InvalidArgumentException::class, 'offset account');
});
