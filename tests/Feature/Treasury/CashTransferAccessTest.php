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
        ['slug' => 'cash_transfers.create'],
        [
            'module' => 'cash_transfers',
            'name' => 'Create Cash Transfers',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantCashTransferLifecyclePermissions(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_transfer_lifecycle_test'],
        ['name' => 'Cash Transfer Lifecycle Test'],
    );

    $permissions = collect([
        ['slug' => 'cash_transfers.approve', 'name' => 'Approve Cash Transfers', 'action' => 'approve'],
        ['slug' => 'cash_transfers.complete', 'name' => 'Complete Cash Transfers', 'action' => 'complete'],
    ])->map(fn(array $permission) => Permission::firstOrCreate(
            ['slug' => $permission['slug']],
            [
                'module' => 'cash_transfers',
                'name' => $permission['name'],
                'action' => $permission['action'],
            ],
        ));

    $role->permissions()->syncWithoutDetaching($permissions->pluck('id'));
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantCashTransferViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_transfer_view_test'],
        ['name' => 'Cash Transfer View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transfers.view'],
        [
            'module' => 'cash_transfers',
            'name' => 'View Cash Transfers',
            'action' => 'view',
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

it('loads the cash transfer queue for users with view permission', function () {
    $fixture = cashTransferFixture();
    grantCashTransferViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-movements.transfers.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cash-movements/index')
            ->has('transfers.data', 0));
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

it('approves and completes a pending cash transfer', function () {
    $fixture = cashTransferFixture();
    grantCashTransferLifecyclePermissions($fixture['user']);
    $transfer = CashTransfer::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'from_cash_location_id' => $fixture['source']->id,
        'to_cash_location_id' => $fixture['target']->id,
        'amount' => 1250.50,
        'transfer_no' => 'TRF-LIFECYCLE-001',
        'status' => 'PENDING',
        'requested_by' => $fixture['user']->id,
        'requested_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.approve', $transfer))
        ->assertRedirect(route('cash-movements.transfers.index'));

    expect($transfer->fresh()->status)->toBe('APPROVED')
        ->and($transfer->fresh()->approved_by)->toBe($fixture['user']->id);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.complete', $transfer))
        ->assertRedirect(route('cash-movements.transfers.index'));

    expect($transfer->fresh()->status)->toBe('COMPLETED')
        ->and($transfer->fresh()->completed_at)->not->toBeNull();
});
