<?php

use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

it('shows organization-scoped voucher activity charts', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $role = Role::firstOrCreate(
        ['slug' => 'accounting_dashboard_test'],
        ['name' => 'Accounting Dashboard Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'accounting.view'],
        [
            'module' => 'accounting',
            'name' => 'View General Accounting',
            'action' => 'view',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);

    Voucher::factory()->posted()->create([
        'organization_id' => $organization->id,
        'voucher_date' => today()->toDateString(),
    ]);
    Voucher::factory()->create([
        'organization_id' => $organization->id,
        'status' => 'DRAFT',
    ]);
    Voucher::factory()->posted()->create();

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('general-accounting.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('general-accounting/dashboard')
            ->has('dailyVoucherActivity', 7)
            ->where('dailyVoucherActivity', fn ($days) => collect($days)->sum('posted') === 1)
            ->where('voucherStatusBreakdown.0.status', 'DRAFT')
            ->where('voucherStatusBreakdown.0.count', 1)
            ->where('voucherStatusBreakdown.1.status', 'POSTED')
            ->where('voucherStatusBreakdown.1.count', 1));
});
