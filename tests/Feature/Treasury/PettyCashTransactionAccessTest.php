<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\PettyCashTransaction;

function grantPettyCashTransactionPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_transaction_test'],
        ['name' => 'Petty Cash Transaction Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.expense'],
        [
            'module' => 'petty_cash',
            'name' => 'Record Petty Cash Expense',
            'action' => 'expense',
        ],
    );

    $createPermission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.create'],
        [
            'module' => 'petty_cash',
            'name' => 'Create Petty Cash Funds',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id, $createPermission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantPettyCashPostPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_post_test'],
        ['name' => 'Petty Cash Post Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.expense'],
        [
            'module' => 'petty_cash',
            'name' => 'Record Petty Cash Expense',
            'action' => 'expense',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantPettyCashTransactionViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_transaction_view_test'],
        ['name' => 'Petty Cash Transaction View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.view'],
        [
            'module' => 'petty_cash',
            'name' => 'View Petty Cash',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function pettyCashTransactionFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $fiscalYear = FiscalYear::factory()->create([
        'organization_id' => $organization->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'status' => 'OPEN',
    ]);
    FiscalPeriod::factory()->create([
        'fiscal_year_id' => $fiscalYear->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'status' => 'OPEN',
    ]);
    $branchDay = BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => '2026-09-18',
        'status' => 'OPEN',
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $location = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'PETTY-TXN-001',
        'name' => 'Transaction Petty Cash Location',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    $fund = PettyCashFund::create([
        'cash_location_id' => $location->id,
        'custodian_id' => $user->id,
        'code' => 'PC-TXN-001',
        'name' => 'Transaction Petty Cash Fund',
        'fund_limit' => 10000,
        'current_balance' => 3500,
        'method' => 'IMPREST',
        'status' => 'ACTIVE',
    ]);

    return compact('organization', 'branch', 'user', 'branchDay', 'location', 'fund');
}

it('loads petty cash funding and expense forms with scoped funds', function () {
    $fixture = pettyCashTransactionFixture();
    grantPettyCashTransactionPermission($fixture['user']);

    foreach (['funding', 'expense'] as $type) {
        $this->actingAs($fixture['user'])
            ->withSession(['active_organization_id' => $fixture['organization']->id])
            ->get(route('petty-cash-transactions.' . $type))
            ->assertSuccessful()
            ->assertInertia(fn($page) => $page
                ->component('treasury-cash/petty-cash/transactions/form')
                ->where('transaction_type', strtoupper($type))
                ->has('funds', 1));
    }
});

it('loads the petty cash transaction queue for users with view permission', function () {
    $fixture = pettyCashTransactionFixture();
    grantPettyCashTransactionViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('petty-cash-transactions.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/petty-cash/transactions/index')
            ->has('transactions.data', 0));
});

it('creates a pending petty cash expense within the users open branch day', function () {
    $fixture = pettyCashTransactionFixture();
    grantPettyCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('petty-cash-transactions.expense.store'), [
            'petty_cash_fund_id' => $fixture['fund']->id,
            'amount' => 125,
            'payee' => 'Office supplier',
            'description' => 'Stationery purchase',
        ])
        ->assertRedirect(route('petty-cash-transactions.expense'));

    $transaction = PettyCashTransaction::query()->firstOrFail();

    expect($transaction->branch_day_id)->toBe($fixture['branchDay']->id)
        ->and($transaction->petty_cash_fund_id)->toBe($fixture['fund']->id)
        ->and($transaction->type)->toBe('EXPENSE')
        ->and($transaction->status)->toBe('PENDING')
        ->and($transaction->amount)->toBe('125.0000')
        ->and($transaction->created_by)->toBe($fixture['user']->id);
});

it('posts a petty cash expense and reduces the fund balance', function () {
    $fixture = pettyCashTransactionFixture();
    grantPettyCashPostPermission($fixture['user']);
    $transaction = PettyCashTransaction::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'petty_cash_fund_id' => $fixture['fund']->id,
        'transaction_no' => 'PETTY-POST-001',
        'type' => 'EXPENSE',
        'amount' => 125,
        'description' => 'Stationery purchase',
        'status' => 'PENDING',
        'created_by' => $fixture['user']->id,
    ]);

    $group = AccountGroup::factory()->create(['organization_id' => $fixture['organization']->id]);
    $expenseAccount = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
    ]);
    $cashAccount = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
    ]);
    TreasuryGlMapping::query()->create([
        'organization_id' => $fixture['organization']->id,
        'source_type' => 'PETTY_CASH_TRANSACTION',
        'source_code' => 'DEFAULT',
        'transaction_type' => 'EXPENSE',
        'debit_account_id' => $expenseAccount->id,
        'credit_account_id' => $cashAccount->id,
        'status' => true,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('petty-cash-transactions.post', $transaction))
        ->assertRedirect(route('petty-cash-transactions.index'));

    expect($transaction->fresh()->status)->toBe('POSTED')
        ->and($fixture['fund']->fresh()->current_balance)->toBe('3375.0000');
});

it('keeps a petty cash transaction pending when its GL mapping is missing', function () {
    $fixture = pettyCashTransactionFixture();
    grantPettyCashPostPermission($fixture['user']);
    $transaction = PettyCashTransaction::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'petty_cash_fund_id' => $fixture['fund']->id,
        'transaction_no' => 'PETTY-UNMAPPED-001',
        'type' => 'EXPENSE',
        'amount' => 125,
        'description' => 'Unmapped expense',
        'status' => 'PENDING',
        'created_by' => $fixture['user']->id,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->from(route('petty-cash-transactions.index'))
        ->post(route('petty-cash-transactions.post', $transaction))
        ->assertRedirect(route('petty-cash-transactions.index'))
        ->assertSessionHas('error', fn(string $message) => str_contains($message, 'No active General Ledger mapping'));

    expect($transaction->fresh()->status)->toBe('PENDING')
        ->and($fixture['fund']->fresh()->current_balance)->toBe('3500.0000')
        ->and(\App\GeneralAccounting\Models\Voucher::query()->count())->toBe(0);
});
