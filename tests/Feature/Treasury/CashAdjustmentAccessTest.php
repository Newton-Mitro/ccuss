<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;

function grantCashAdjustmentCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_adjustment_create_test'],
        ['name' => 'Cash Adjustment Create Test'],
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

function cashAdjustmentFixture(): array
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
        'code' => 'ADJUSTMENT-TELLER',
        'name' => 'Adjustment Teller Location',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $location->id,
        'user_id' => $user->id,
        'code' => 'ADJ-001',
        'name' => 'Adjustment Teller',
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

it('loads the teller cash adjustment form with scoped sessions', function () {
    $fixture = cashAdjustmentFixture();
    grantCashAdjustmentCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-adjustments.teller-cash-adjustment'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cash-adjustments/teller-cash-adjustment')
            ->has('teller_sessions', 1));
});

it('creates a pending shortage adjustment for an open teller session', function () {
    $fixture = cashAdjustmentFixture();
    grantCashAdjustmentCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-adjustments.teller-cash-adjustment.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => 75,
            'type' => 'SHORTAGE',
            'reason' => 'Cash count difference',
        ])
        ->assertRedirect(route('cash-adjustments.teller-cash-adjustment'));

    $adjustment = CashAdjustment::query()->firstOrFail();

    expect($adjustment->teller_session_id)->toBe($fixture['session']->id)
        ->and($adjustment->branch_day_id)->toBe($fixture['branchDay']->id)
        ->and($adjustment->cash_location_id)->toBe($fixture['location']->id)
        ->and($adjustment->amount)->toBe('75.0000')
        ->and($adjustment->type)->toBe('SHORTAGE')
        ->and($adjustment->status)->toBe('PENDING')
        ->and($adjustment->requested_by)->toBe($fixture['user']->id);
});
