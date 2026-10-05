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
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\PettyCashTransaction;

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

function grantPettyCashUpdatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'petty_cash_update_test'],
        ['name' => 'Petty Cash Update Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'petty_cash.update'],
        [
            'module' => 'petty_cash',
            'name' => 'Update Petty Cash Funds',
            'action' => 'update',
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
    $otherBranch = Branch::factory()->create(['organization_id' => $organization->id]);
    $otherOrganization = Organization::factory()->create();
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $memberUser = User::factory()->create([
        'organization_id' => $otherOrganization->id,
        'branch_id' => null,
    ]);
    $memberUser->organizations()->syncWithoutDetaching([$organization->id]);
    grantPettyCashCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('petty-cash-accounts.create'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/petty-cash/accounts/create')
            ->has('branches', 2)
            ->has('users', 2)
            ->where('users', fn($users) => collect($users)->contains('id', $memberUser->id))
            ->where('default_custodian_id', $user->id)
            ->where('default_branch_id', $branch->id));
});

it('creates a petty cash fund from the UI flow', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $selectedBranch = Branch::factory()->create(['organization_id' => $organization->id]);
    $otherOrganization = Organization::factory()->create();
    $custodian = User::factory()->create([
        'organization_id' => $otherOrganization->id,
        'branch_id' => null,
    ]);
    $custodian->organizations()->syncWithoutDetaching([$organization->id]);
    grantPettyCashCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('petty-cash-accounts.store'), [
            'branch_id' => $selectedBranch->id,
            'custodian_id' => $custodian->id,
            'code' => 'PC-NEW-100',
            'name' => 'New Petty Cash Fund',
            'fund_limit' => 25000,
            'method' => 'IMPREST',
            'status' => 'ACTIVE',
        ])
        ->assertRedirect(route('petty-cash-accounts.index'));

    $cashLocation = CashLocation::query()->where('code', 'PC-NEW-100')->firstOrFail();
    $fund = PettyCashFund::query()->where('code', 'PC-NEW-100')->firstOrFail();

    expect($fund->cash_location_id)->toBe($cashLocation->id)
        ->and($fund->custodian_id)->toBe($custodian->id)
        ->and($cashLocation->branch_id)->toBe($selectedBranch->id)
        ->and($cashLocation->type)->toBe('PETTY_CASH');
});

it('rejects petty cash creation for a branch outside the active organization', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $otherOrganization = Organization::factory()->create();
    $otherBranch = Branch::factory()->create(['organization_id' => $otherOrganization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    grantPettyCashCreatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('petty-cash-accounts.store'), [
            'branch_id' => $otherBranch->id,
            'custodian_id' => $user->id,
            'code' => 'PC-UNAUTHORIZED-100',
            'name' => 'Unauthorized Petty Cash Fund',
            'fund_limit' => 25000,
        ])
        ->assertSessionHasErrors('branch_id');

    expect(CashLocation::query()->where('code', 'PC-UNAUTHORIZED-100')->exists())->toBeFalse()
        ->and(PettyCashFund::query()->where('code', 'PC-UNAUTHORIZED-100')->exists())->toBeFalse();
});

it('edits a petty cash fund and moves its location when it has no history', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $targetBranch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $cashLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'PC-EDIT-100',
        'name' => 'Edit Petty Cash Location',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    $fund = PettyCashFund::create([
        'cash_location_id' => $cashLocation->id,
        'code' => 'PC-EDIT-100',
        'name' => 'Edit Petty Cash Fund',
        'fund_limit' => 10000,
        'current_balance' => 2500,
        'method' => 'IMPREST',
        'status' => 'ACTIVE',
    ]);
    grantPettyCashUpdatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('petty-cash-accounts.edit', $fund))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/petty-cash/accounts/create')
            ->has('branches', 2)
            ->where('branch_locked', false));

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->put(route('petty-cash-accounts.update', $fund), [
            'branch_id' => $targetBranch->id,
            'custodian_id' => $user->id,
            'code' => 'PC-EDIT-100',
            'name' => 'Updated Petty Cash Fund',
            'fund_limit' => 15000,
            'method' => 'VARIABLE',
            'status' => 'ACTIVE',
        ])
        ->assertSessionHas('success');

    expect($fund->fresh()->name)->toBe('Updated Petty Cash Fund')
        ->and($fund->fresh()->custodian_id)->toBe($user->id)
        ->and($fund->fresh()->fund_limit)->toBe('15000.0000')
        ->and($fund->fresh()->current_balance)->toBe('2500.0000')
        ->and($cashLocation->fresh()->branch_id)->toBe($targetBranch->id);
});

it('prevents moving a petty cash fund after it has transaction history', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $targetBranch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $cashLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'PC-HISTORY-100',
        'name' => 'Historical Petty Cash Location',
        'type' => 'PETTY_CASH',
        'is_active' => true,
    ]);
    $fund = PettyCashFund::create([
        'cash_location_id' => $cashLocation->id,
        'code' => 'PC-HISTORY-100',
        'name' => 'Historical Petty Cash Fund',
        'fund_limit' => 10000,
        'current_balance' => 2500,
        'method' => 'IMPREST',
        'status' => 'ACTIVE',
    ]);
    $branchDay = BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => '2026-09-18',
        'status' => 'OPEN',
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    PettyCashTransaction::create([
        'branch_day_id' => $branchDay->id,
        'petty_cash_fund_id' => $fund->id,
        'transaction_no' => 'PC-HISTORY-TXN-001',
        'type' => 'EXPENSE',
        'amount' => 50,
        'status' => 'PENDING',
        'created_by' => $user->id,
    ]);
    grantPettyCashUpdatePermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('petty-cash-accounts.edit', $fund))
        ->assertInertia(fn($page) => $page->where('branch_locked', true));

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->put(route('petty-cash-accounts.update', $fund), [
            'branch_id' => $targetBranch->id,
            'custodian_id' => $user->id,
            'code' => 'PC-HISTORY-100',
            'name' => 'Historical Petty Cash Fund',
            'fund_limit' => 10000,
            'method' => 'IMPREST',
            'status' => 'ACTIVE',
        ])
        ->assertSessionHasErrors('branch_id');

    expect($cashLocation->fresh()->branch_id)->toBe($branch->id);
});
