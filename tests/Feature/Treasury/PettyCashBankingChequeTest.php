<?php

use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function grantTreasuryModulePermissions(User $user, array $slugs = ['treasury.view', 'petty_cash.view', 'banking.view', 'cheques.view']): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'treasury_module_test'],
        ['name' => 'Treasury Module Test'],
    );

    foreach ($slugs as $slug) {
        $permission = Permission::updateOrCreate(
            ['slug' => $slug],
            ['module' => str($slug)->beforeLast('.')->replace(['_', '-'], ' ')->title()->toString(), 'name' => $slug, 'action' => str($slug)->afterLast('.')],
        );
        $role->permissions()->syncWithoutDetaching([$permission->id]);
    }

    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('allows access to petty cash, banking, and cheque indexes for authorized users', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    grantTreasuryModulePermissions($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('petty-cash.index'))
        ->assertSuccessful();

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('bank-accounts.index'))
        ->assertSuccessful();

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('cheque-books.index'))
        ->assertSuccessful();
});
