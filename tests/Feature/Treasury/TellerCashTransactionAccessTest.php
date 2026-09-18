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
