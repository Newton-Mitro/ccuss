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

it('rejects counts for a closed branch day', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_CLOSED, 'opened_at' => now(), 'opened_by' => $user->id]);
    $location = CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'code' => 'VAULT-2', 'name' => 'Closed Vault', 'type' => 'VAULT', 'is_active' => true]);
    $denomination = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'NOTE', 'value' => 100, 'is_active' => true]);

    expect(fn() => app(CashCountService::class)->createCount(['branch_day_id' => $branchDay->id, 'cash_location_id' => $location->id, 'type' => 'CLOSING', 'denominations' => [['cash_denomination_id' => $denomination->id, 'quantity' => 1]]], $organization->id, $user->id))->toThrow(RuntimeException::class, 'open branch day');
});
