<?php

use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;

it('creates organization-scoped account groups and ledger accounts', function () {
    $organization = Organization::factory()->create();
    $group = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);

    $account = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1100',
        'name' => 'Cash in Hand',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);

    expect($group->level)->toBe(0)
        ->and($account->level)->toBe(0)
        ->and($account->organization_id)->toBe($organization->id);
});

it('rejects duplicate account codes within an organization', function () {
    $organization = Organization::factory()->create();
    $groupService = app(AccountGroupService::class);
    $accountService = app(LedgerAccountService::class);
    $group = $groupService->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);

    $accountService->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);

    expect(fn() => $accountService->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1100',
        'name' => 'Duplicate Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]))->toThrow(RuntimeException::class, 'Ledger account code already exists');
});

it('rejects cross-organization parents and protects referenced hierarchy nodes', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $groupService = app(AccountGroupService::class);
    $accountService = app(LedgerAccountService::class);

    $group = $groupService->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $otherGroup = $groupService->create([
        'organization_id' => $otherOrganization->id,
        'code' => '1000',
        'name' => 'Other Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);

    expect(fn() => $accountService->create([
        'organization_id' => $organization->id,
        'account_group_id' => $otherGroup->id,
        'code' => '1100',
        'name' => 'Invalid Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]))->toThrow(InvalidArgumentException::class, 'account group is invalid');

    $account = $accountService->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);

    expect(fn() => $groupService->delete($group))
        ->toThrow(RuntimeException::class, 'with children or ledger accounts');
    expect($accountService->delete($account))->toBeTrue()
        ->and(LedgerAccount::find($account->id))->toBeNull();
});
