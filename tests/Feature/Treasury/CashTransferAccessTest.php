<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\CashTransfer;

function grantCashTransferCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_transfer_create_test'],
        ['name' => 'Cash Transfer Create Test'],
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

function cashTransferFixture(): array
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
    $source = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TRANSFER-SOURCE',
        'name' => 'Transfer Source',
        'type' => 'VAULT',
        'is_active' => true,
    ]);
    $target = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TRANSFER-TARGET',
        'name' => 'Transfer Target',
        'type' => 'TELLER',
        'is_active' => true,
    ]);

    return compact('organization', 'branch', 'user', 'branchDay', 'source', 'target');
}

it('loads the teller-to-teller transfer form with scoped transfer data', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-movements.teller-to-teller-transfer'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cash-movements/teller-to-teller-transfer')
            ->has('branch_day')
            ->has('cash_locations', 2));
});

it('does not expose cash transfer forms without create permission', function () {
    $fixture = cashTransferFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-movements.teller-to-teller-transfer'))
        ->assertForbidden();
});

it('creates a pending cash transfer within the users open branch day', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.teller-to-teller-transfer.store'), [
            'from_cash_location_id' => $fixture['source']->id,
            'to_cash_location_id' => $fixture['target']->id,
            'amount' => 1250.50,
            'note' => 'Till replenishment',
        ])
        ->assertRedirect(route('cash-movements.teller-to-teller-transfer'));

    $transfer = CashTransfer::query()->firstOrFail();

    expect($transfer->branch_day_id)->toBe($fixture['branchDay']->id)
        ->and($transfer->from_cash_location_id)->toBe($fixture['source']->id)
        ->and($transfer->to_cash_location_id)->toBe($fixture['target']->id)
        ->and($transfer->status)->toBe('PENDING')
        ->and($transfer->requested_by)->toBe($fixture['user']->id)
        ->and($transfer->note)->toBe('Till replenishment');
});
