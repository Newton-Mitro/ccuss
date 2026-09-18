<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;

function grantBranchDayPermissions(User $user, array $slugs = ['branch_days.view', 'branch_days.open', 'branch_days.close']): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'branch_day_test'],
        ['name' => 'Branch Day Test'],
    );

    foreach ($slugs as $slug) {
        $permission = Permission::updateOrCreate(
            ['slug' => $slug],
            ['module' => 'branch_days', 'name' => $slug, 'action' => str($slug)->afterLast('.')],
        );
        $role->permissions()->syncWithoutDetaching([$permission->id]);
    }

    $user->roles()->syncWithoutDetaching([$role->id]);
}

function branchDayFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    return compact('organization', 'branch', 'user');
}

it('opens and closes a branch day through its lifecycle routes', function () {
    $fixture = branchDayFixture();
    grantBranchDayPermissions($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('branch-days.store'), [
            'branch_id' => $fixture['branch']->id,
            'business_date' => '2026-09-18',
        ])
        ->assertRedirect();

    $branchDay = BranchDay::firstOrFail();
    expect($branchDay->status)->toBe(BranchDay::STATUS_OPEN);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->put(route('branch-days.close', $branchDay))
        ->assertRedirect();

    expect($branchDay->fresh()->status)->toBe(BranchDay::STATUS_CLOSED);
});

it('rejects duplicate branch days for the same branch and date', function () {
    $fixture = branchDayFixture();
    grantBranchDayPermissions($fixture['user']);

    BranchDay::create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'business_date' => '2026-09-18',
        'status' => BranchDay::STATUS_OPEN,
        'opened_by' => $fixture['user']->id,
        'opened_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('branch-days.store'), [
            'branch_id' => $fixture['branch']->id,
            'business_date' => '2026-09-18',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('forbids users without branch day permissions', function () {
    $fixture = branchDayFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('branch-days.index'))
        ->assertForbidden();
});
