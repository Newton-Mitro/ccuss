<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;

function grantBankCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'banks_create_test'],
        ['name' => 'Banks Create Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'banks.create'],
        [
            'module' => 'banks',
            'name' => 'Create Banks',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantPettyCashCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_create_test'],
        ['name' => 'Petty Cash Create Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.create'],
        [
            'module' => 'petty_cash',
            'name' => 'Create Petty Cash Funds',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantBankAccountCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'bank_accounts_create_test'],
        ['name' => 'Bank Accounts Create Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'bank_accounts.create'],
        [
            'module' => 'bank_accounts',
            'name' => 'Create Bank Accounts',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('loads the bank create form for authorized users', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantBankCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('banks.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('treasury-cash/banking/banks/create'));
});

it('creates a bank record from the UI flow', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantBankCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('banks.store'), [
            'code' => 'BANK-500',
            'name' => 'Eastern Bank',
            'short_name' => 'EB',
            'status' => true,
        ])
        ->assertRedirect(route('banks.index'));

    expect(Bank::query()->where('code', 'BANK-500')->exists())->toBeTrue();
});

it('creates a bank account from the UI flow', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $bank = Bank::create([
        'organization_id' => $organization->id,
        'code' => 'BANK-ACCOUNT-500',
        'name' => 'Account Bank',
        'status' => true,
    ]);
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'BANK',
    ]);
    grantBankAccountCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('bank-accounts.store'), [
            'bank_id' => $bank->id,
            'financial_account_id' => $financialAccount->id,
            'branch_id' => $branch->id,
            'account_name' => 'New Operating Account',
            'account_number' => 'BANK-ACCOUNT-5001',
            'account_type' => 'CURRENT',
            'opening_balance' => 5000,
            'is_reconcilable' => true,
            'status' => 'ACTIVE',
        ])
        ->assertRedirect(route('bank-accounts.index'));

    expect(BankAccount::query()->where('account_number', 'BANK-ACCOUNT-5001')->exists())->toBeTrue();
});

it('loads the bank account create page with valid financial account options', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    Bank::create([
        'organization_id' => $organization->id,
        'code' => 'BANK-ACCOUNT-GET',
        'name' => 'Account Page Bank',
        'status' => true,
    ]);
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'BANK',
    ]);
    grantBankAccountCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('bank-accounts.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/banking/accounts/create')
            ->has('financial_accounts', 1)
            ->where('financial_accounts.0.account_no', $financialAccount->account_no));
});

it('loads the petty cash create form for authorized users', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $cashLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'PETTY-CREATE-001',
        'name' => 'Creation Cash Location',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    grantPettyCashCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('petty-cash-accounts.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('treasury-cash/petty-cash/accounts/create'));

    expect($cashLocation->fresh()->id)->toBe($cashLocation->id);
});

it('creates a petty cash fund from the UI flow', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $cashLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'PETTY-CREATE-002',
        'name' => 'Creation Cash Location 2',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    grantPettyCashCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('petty-cash-accounts.store'), [
            'cash_location_id' => $cashLocation->id,
            'code' => 'PC-NEW-100',
            'name' => 'New Petty Cash Fund',
            'fund_limit' => 25000,
            'method' => 'IMPREST',
            'status' => 'ACTIVE',
        ])
        ->assertRedirect(route('petty-cash-accounts.index'));

    expect(PettyCashFund::query()->where('code', 'PC-NEW-100')->exists())->toBeTrue();
});
