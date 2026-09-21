<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
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
