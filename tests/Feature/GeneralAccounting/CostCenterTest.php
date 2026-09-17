<?php

use App\GeneralAccounting\Application\CostCenterService;
use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Models\VoucherEntry;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function costCenterFixture(): array
{
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $role = Role::firstOrCreate(
        ['slug' => 'cost_center_test'],
        ['name' => 'Cost Center Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'accounting.cost_centers.view'],
        [
            'module' => 'accounting_cost_centers',
            'name' => 'View Cost Centers',
            'action' => 'view',
        ],
    );
    $role->permissions()->attach($permission);
    $user->roles()->attach($role);

    return compact('organization', 'user');
}

it('creates hierarchical cost centers with organization-scoped levels', function () {
    $organization = Organization::factory()->create();
    $service = app(CostCenterService::class);

    $parent = $service->create([
        'organization_id' => $organization->id,
        'code' => 'CC-OPS',
        'name' => 'Operations',
        'status' => true,
    ]);
    $child = $service->create([
        'organization_id' => $organization->id,
        'parent_id' => $parent->id,
        'code' => 'CC-FIN',
        'name' => 'Finance',
        'status' => true,
    ]);

    expect($parent->level)->toBe(0)
        ->and($child->level)->toBe(1)
        ->and($child->organization_id)->toBe($organization->id);
});

it('rejects duplicate codes and cross-organization parents', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $service = app(CostCenterService::class);
    $parent = CostCenter::factory()->create(['organization_id' => $otherOrganization->id]);

    $service->create([
        'organization_id' => $organization->id,
        'code' => 'CC-OPS',
        'name' => 'Operations',
    ]);

    expect(fn() => $service->create([
        'organization_id' => $organization->id,
        'code' => 'cc-ops',
        'name' => 'Duplicate',
    ]))->toThrow(RuntimeException::class)
        ->and(fn() => $service->create([
            'organization_id' => $organization->id,
            'parent_id' => $parent->id,
            'code' => 'CC-FIN',
            'name' => 'Finance',
        ]))->toThrow(InvalidArgumentException::class);
});

it('prevents deleting cost centers with children or voucher entries', function () {
    $organization = Organization::factory()->create();
    $service = app(CostCenterService::class);
    $parent = CostCenter::factory()->create(['organization_id' => $organization->id]);
    CostCenter::factory()->create(['organization_id' => $organization->id, 'parent_id' => $parent->id]);

    expect(fn() => $service->delete($parent))->toThrow(RuntimeException::class);

    $used = CostCenter::factory()->create(['organization_id' => $organization->id]);
    VoucherEntry::factory()->create(['cost_center_id' => $used->id]);

    expect(fn() => $service->delete($used))->toThrow(RuntimeException::class);
});

it('stores a cost center on a voucher entry', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);
    $group = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    $costCenter = CostCenter::factory()->create(['organization_id' => $organization->id]);

    $voucher = app(VoucherService::class)->createDraft([
        'fiscal_period_id' => $period->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $cash->id, 'cost_center_id' => $costCenter->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $cash->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $organization->id, $user->id);

    expect($voucher->entries()->first()->cost_center_id)->toBe($costCenter->id);
});

it('loads the cost center index for an authorized organization user', function () {
    $fixture = costCenterFixture();
    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cost-centers.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page->component('general-accounting/cost-centers/index'));
});

it('forbids users without cost center permission', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('cost-centers.index'))
        ->assertForbidden();
});
