<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\CashCountService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashDenomination;
use App\TreasuryAndCash\Models\CashLocation;

it('records denomination quantities and calculates the cash count total', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_OPEN, 'opened_at' => now(), 'opened_by' => $user->id]);
    $location = CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'code' => 'VAULT-1', 'name' => 'Main Vault', 'type' => 'VAULT', 'is_active' => true]);
    $note = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'NOTE', 'value' => 100, 'name' => '100 taka', 'is_active' => true]);
    $coin = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'COIN', 'value' => 5, 'name' => '5 taka', 'is_active' => true]);

    $count = app(CashCountService::class)->createCount([
        'branch_day_id' => $branchDay->id,
        'cash_location_id' => $location->id,
        'type' => 'VERIFICATION',
        'denominations' => [
            ['cash_denomination_id' => $note->id, 'quantity' => 3],
            ['cash_denomination_id' => $coin->id, 'quantity' => 2],
        ],
    ], $organization->id, $user->id);

    expect($count->total_amount)->toBe('310.0000')->and($count->denominations)->toHaveCount(2);
});

it('has a bangladesh denomination preset', function () {
    $preset = CashDenomination::bangladeshPreset();

    expect($preset)->toBeArray()
        ->and($preset)->toContainEqual(['currency' => 'BDT', 'type' => 'NOTE', 'value' => 1000, 'name' => '1000 Taka', 'is_active' => true, 'sort_order' => 9])
        ->and($preset)->toContainEqual(['currency' => 'BDT', 'type' => 'COIN', 'value' => 1, 'name' => '1 Taka Coin', 'is_active' => true, 'sort_order' => 12]);
});

it('can seed the bangladesh denomination preset through the denomination store flow', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);

    $role = \App\SystemAdministration\Models\Role::firstOrCreate(
        ['slug' => 'cash_count_preset_test'],
        ['name' => 'Cash Count Preset Test']
    );
    $permission = \App\SystemAdministration\Models\Permission::firstOrCreate(
        ['slug' => 'cash_transactions.create'],
        ['module' => 'cash_transactions', 'name' => 'Create Cash Transactions', 'action' => 'create']
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->post(route('cash-denominations.store'), ['preset' => 'BANGLADESH'])
        ->assertRedirect();

    expect(CashDenomination::query()->where('organization_id', $organization->id)->count())->toBeGreaterThanOrEqual(12)
        ->and(CashDenomination::query()->where('organization_id', $organization->id)->where('currency', 'BDT')->count())->toBeGreaterThan(0);
});

it('rejects counts for a closed branch day', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_CLOSED, 'opened_at' => now(), 'opened_by' => $user->id]);
    $location = CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'code' => 'VAULT-2', 'name' => 'Closed Vault', 'type' => 'VAULT', 'is_active' => true]);
    $denomination = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'NOTE', 'value' => 100, 'is_active' => true]);

    expect(fn() => app(CashCountService::class)->createCount(['branch_day_id' => $branchDay->id, 'cash_location_id' => $location->id, 'type' => 'CLOSING', 'denominations' => [['cash_denomination_id' => $denomination->id, 'quantity' => 1]]], $organization->id, $user->id))->toThrow(RuntimeException::class, 'open branch day');
});
