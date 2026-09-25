<?php

use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;

function grantTellerCashTransactionPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_test'],
        ['name' => 'Teller Cash Transaction Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.create'],
        [
            'module' => 'cash_transactions',
            'name' => 'Create Cash Transactions',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionPostPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_post_test'],
        ['name' => 'Teller Cash Transaction Post Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.post'],
        [
            'module' => 'cash_transactions',
            'name' => 'Post Cash Transactions',
            'action' => 'post',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_view_test'],
        ['name' => 'Teller Cash Transaction View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.view'],
        [
            'module' => 'cash_transactions',
            'name' => 'View Cash Transactions',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function tellerCashTransactionFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
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
        'code' => 'TRANSACTION-TELLER',
        'name' => 'Transaction Teller Location',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $location->id,
        'user_id' => $user->id,
        'code' => 'TXN-001',
        'name' => 'Transaction Teller',
        'status' => 'ACTIVE',
        'maximum_cash' => 25000,
    ]);
    $session = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $teller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 5000,
        'opened_at' => now(),
    ]);

    return compact('organization', 'branch', 'user', 'branchDay', 'location', 'teller', 'session');
}

it('loads deposit and withdrawal forms with scoped teller sessions', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    foreach (['deposit', 'withdrawal'] as $type) {
        $this->actingAs($fixture['user'])
            ->withSession(['active_organization_id' => $fixture['organization']->id])
            ->get(route('teller-transactions.' . $type))
            ->assertSuccessful()
            ->assertInertia(fn($page) => $page
                ->component('treasury-cash/teller-transactions/form')
                ->where('transaction_type', strtoupper($type))
                ->has('teller_sessions', 1));
    }
});

it('loads the teller transaction queue for users with view permission', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-transactions/index')
            ->has('transactions.data', 0));
});

it('loads the customer deposit page without a selected customer', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.customer-deposit'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-deposits/customer-deposit-page')
            ->where('customer', null)
            ->where('customerAccounts', []));
});

it('loads the customer deposit page with open teller sessions available', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.customer-deposit'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-deposits/customer-deposit-page')
            ->has('teller_sessions', 1)
            ->where('teller_sessions.0.id', $fixture['session']->id));
});

it('creates a pending teller cash deposit for an open session', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => 300,
            'reference' => 'DEP-001',
            'note' => 'Customer cash deposit',
        ])
        ->assertRedirect(route('teller-transactions.deposit'));

    $transaction = TellerCashTransaction::query()->firstOrFail();

    expect($transaction->teller_session_id)->toBe($fixture['session']->id)
        ->and($transaction->cash_location_id)->toBe($fixture['location']->id)
        ->and($transaction->type)->toBe('DEPOSIT')
        ->and($transaction->status)->toBe('PENDING')
        ->and($transaction->amount)->toBe('300.0000')
        ->and($transaction->requested_by)->toBe($fixture['user']->id);
});

it('creates a pending customer deposit from selected obligations', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-002',
    ]);
    $savingsAccount = FinancialAccount::factory()->active(1000)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-CUST-002',
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.customer-deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'customer_id' => $customer->id,
            'amount' => '10.00',
            'selected' => ['deposit-' . $savingsAccount->id],
            'note' => 'Customer cash deposit',
        ])
        ->assertRedirect(route('teller-transactions.customer-deposit', ['customer_id' => $customer->id]));

    $transaction = TellerCashTransaction::query()->latest()->firstOrFail();

    expect($transaction->type)->toBe('DEPOSIT')
        ->and($transaction->amount)->toBe('10.0000')
        ->and($transaction->financial_transaction_id)->not->toBeNull();
});

it('posts a pending deposit and updates the teller expected cash', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPostPermission($fixture['user']);
    $transaction = TellerCashTransaction::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'cash_location_id' => $fixture['location']->id,
        'teller_session_id' => $fixture['session']->id,
        'transaction_no' => 'TELLER-POST-001',
        'type' => 'DEPOSIT',
        'amount' => 300,
        'status' => 'PENDING',
        'requested_by' => $fixture['user']->id,
        'requested_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.post', $transaction))
        ->assertRedirect(route('teller-transactions.index'));

    expect($transaction->fresh()->status)->toBe('POSTED')
        ->and($transaction->fresh()->posted_by)->toBe($fixture['user']->id)
        ->and($transaction->fresh()->posted_at)->not->toBeNull()
        ->and($fixture['session']->fresh()->expected_cash)->toBe('5300.0000');
});

it('creates and posts a multi-line financial deposit with the teller cash leg', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    grantTellerCashTransactionPostPermission($fixture['user']);

    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-001',
    ]);
    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-001',
    ]);
    $shareAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'SHARE',
        'account_no' => 'SHARE-001',
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => '300',
            'lines' => [
                ['financial_account_id' => $savingsAccount->id, 'amount' => '200'],
                ['financial_account_id' => $shareAccount->id, 'amount' => '100'],
            ],
        ])
        ->assertRedirect(route('teller-transactions.deposit'));

    $transaction = TellerCashTransaction::query()->with('financialTransaction.entries')->firstOrFail();

    expect($transaction->financial_transaction_id)->not->toBeNull()
        ->and($transaction->financialTransaction->entries)->toHaveCount(3)
        ->and($transaction->financialTransaction->status)->toBe('PENDING');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.post', $transaction))
        ->assertRedirect(route('teller-transactions.index'));

    expect($cashAccount->fresh()->balance)->toBe('300.0000')
        ->and($savingsAccount->fresh()->balance)->toBe('200.0000')
        ->and($shareAccount->fresh()->balance)->toBe('100.0000')
        ->and($transaction->fresh()->status)->toBe('POSTED')
        ->and($fixture['session']->fresh()->expected_cash)->toBe('5300.0000');
});
