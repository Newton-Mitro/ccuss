<?php

use App\FinancialServices\Models\FinancialAccount;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankTransaction;

function grantBankingViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'banking_view_test'],
        ['name' => 'Banking View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'bank_accounts.view'],
        [
            'module' => 'bank_accounts',
            'name' => 'View Bank Accounts',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantBankTransactionPermissions(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'bank_transactions_test'],
        ['name' => 'Bank Transactions Test'],
    );

    $permissions = collect([
        ['slug' => 'bank_transactions.view', 'name' => 'View Bank Transactions', 'action' => 'view'],
        ['slug' => 'bank_transactions.create', 'name' => 'Create Bank Transactions', 'action' => 'create'],
    ])->map(fn (array $permission) => Permission::firstOrCreate(
        ['slug' => $permission['slug']],
        [
            'module' => 'bank_transactions',
            'name' => $permission['name'],
            'action' => $permission['action'],
        ],
    ));

    $role->permissions()->syncWithoutDetaching($permissions->pluck('id'));
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function bankAccountFixture(): array
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
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'BANK',
    ]);
    $account = BankAccount::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_account_id' => $financialAccount->id,
        'account_name' => 'Main Operating Account',
        'account_number' => '00123456789',
        'routing_number' => '110001',
        'account_type' => 'CURRENT',
        'opening_balance' => 25000,
        'is_reconcilable' => true,
        'status' => 'ACTIVE',
    ]);

    return compact('organization', 'branch', 'user', 'account');
}

it('loads bank accounts for authorized organization users', function () {
    $fixture = bankAccountFixture();
    grantBankingViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('bank-accounts.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('treasury-cash/banking/accounts/index')
            ->has('accounts.data', 1)
            ->where('accounts.data.0.account_number', $fixture['account']->account_number)
            ->where('accounts.data.0.balance', fn ($balance) => (float) $balance === 25000.0));
});

it('does not expose bank accounts without banking permission', function () {
    $fixture = bankAccountFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('bank-accounts.index'))
        ->assertForbidden();
});

it('creates and posts a bank transaction for an open branch day', function () {
    $fixture = bankAccountFixture();
    $branchDay = \App\TreasuryAndCash\Models\BranchDay::create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'business_date' => '2026-09-21',
        'status' => 'OPEN',
        'opened_at' => now(),
        'opened_by' => $fixture['user']->id,
    ]);
    grantBankTransactionPermissions($fixture['user']);
    grantBankingViewPermission($fixture['user']);
    $group = AccountGroup::factory()->create(['organization_id' => $fixture['organization']->id]);
    $bankControl = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
        'code' => '1200',
        'is_cash_account' => true,
        'is_control_account' => true,
    ]);
    $counterpart = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
        'code' => '1100',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('bank-transactions.store'), [
            'bank_account_id' => $fixture['account']->id,
            'counterpart_account_id' => $counterpart->id,
            'type' => 'DEPOSIT',
            'amount' => 500,
            'transaction_date' => '2026-09-21',
            'reference' => 'DEP-001',
        ])
        ->assertRedirect(route('bank-transactions.index'));

    $transaction = BankTransaction::query()->firstOrFail();

    expect($transaction->status)->toBe('PENDING')
        ->and($transaction->branch_day_id)->toBe($branchDay->id)
        ->and($transaction->counterpart_account_id)->toBe($counterpart->id);

    $transaction->update(['counterpart_account_id' => null]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('bank-transactions.post', $transaction), [
            'counterpart_account_id' => $counterpart->id,
        ])
        ->assertRedirect(route('bank-transactions.index'));

    expect($transaction->fresh()->status)->toBe('POSTED')
        ->and($transaction->fresh()->balance_after)->toBe('25500.0000')
        ->and($transaction->fresh()->counterpart_account_id)->toBe($counterpart->id)
        ->and(Voucher::query()->where('voucher_no', 'BANK-GL-'.$transaction->id)->exists())->toBeTrue()
        ->and(Voucher::query()->where('voucher_no', 'BANK-GL-'.$transaction->id)->firstOrFail()->entries()->where('account_id', $bankControl->id)->where('debit', 500)->exists())->toBeTrue()
        ->and(Voucher::query()->where('voucher_no', 'BANK-GL-'.$transaction->id)->firstOrFail()->entries()->where('account_id', $counterpart->id)->where('credit', 500)->exists())->toBeTrue();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('bank-accounts.index'))
        ->assertInertia(fn ($page) => $page
            ->where('accounts.data.0.balance', fn ($balance) => (float) $balance === 25500.0));
});

it('rejects the bank control account as its own transaction counterpart', function () {
    $fixture = bankAccountFixture();
    grantBankTransactionPermissions($fixture['user']);

    $group = AccountGroup::factory()->create(['organization_id' => $fixture['organization']->id]);
    $bankControl = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
        'code' => '1200',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->from(route('bank-transactions.create'))
        ->post(route('bank-transactions.store'), [
            'bank_account_id' => $fixture['account']->id,
            'counterpart_account_id' => $bankControl->id,
            'type' => 'DEPOSIT',
            'amount' => 10,
            'transaction_date' => '2026-09-21',
        ])
        ->assertRedirect(route('bank-transactions.create'))
        ->assertSessionHasErrors(['counterpart_account_id']);

    expect(BankTransaction::query()->count())->toBe(0);
});
