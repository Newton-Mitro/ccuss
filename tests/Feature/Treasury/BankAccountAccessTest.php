<?php

use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\Bank;
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
    ])->map(fn(array $permission) => Permission::firstOrCreate(
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
    $bank = Bank::create([
        'organization_id' => $organization->id,
        'code' => 'BANK-001',
        'name' => 'Main Commercial Bank',
        'short_name' => 'MCB',
        'status' => true,
    ]);
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'BANK',
    ]);
    $account = BankAccount::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'bank_id' => $bank->id,
        'financial_account_id' => $financialAccount->id,
        'account_name' => 'Main Operating Account',
        'account_number' => '00123456789',
        'routing_number' => '110001',
        'account_type' => 'CURRENT',
        'opening_balance' => 25000,
        'is_reconcilable' => true,
        'status' => 'ACTIVE',
    ]);

    return compact('organization', 'branch', 'user', 'bank', 'account');
}

it('loads bank accounts for authorized organization users', function () {
    $fixture = bankAccountFixture();
    grantBankingViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('bank-accounts.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/banking/accounts/index')
            ->has('accounts.data', 1)
            ->where('accounts.data.0.account_number', $fixture['account']->account_number));
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

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('bank-transactions.store'), [
            'bank_account_id' => $fixture['account']->id,
            'type' => 'DEPOSIT',
            'amount' => 500,
            'transaction_date' => '2026-09-21',
            'reference' => 'DEP-001',
        ])
        ->assertRedirect(route('bank-transactions.index'));

    $transaction = BankTransaction::query()->firstOrFail();

    expect($transaction->status)->toBe('PENDING')
        ->and($transaction->branch_day_id)->toBe($branchDay->id);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('bank-transactions.post', $transaction))
        ->assertRedirect(route('bank-transactions.index'));

    expect($transaction->fresh()->status)->toBe('POSTED')
        ->and($transaction->fresh()->balance_after)->toBe('25500.0000');
});
