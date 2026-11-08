<?php

use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

test('users cannot switch to an organization they do not belong to', function () {
    $user = User::factory()->create();
    $otherOrganization = Organization::factory()->create();

    $this->actingAs($user)
        ->post(route('organizations.switch'), [
            'organization_id' => $otherOrganization->id,
        ])
        ->assertForbidden();
});

test('users can switch to their primary organization', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('organizations.switch'), [
            'organization_id' => $user->organization_id,
        ])
        ->assertRedirect();

    expect(session('active_organization_id'))->toBe($user->organization_id);
});

test('users can load organizations after authentication', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withoutMiddleware()
        ->get(route('organizations.index'))
        ->assertSuccessful();
});

test('a user can be added to an organization from its detail page', function () {
    $manager = User::factory()->create();
    $user = User::factory()->create();
    $primaryOrganizationId = $user->organization_id;
    $organizationId = $manager->organization_id;
    $role = Role::query()->create([
        'name' => 'Organization manager',
        'slug' => 'organization-manager',
    ]);
    $permission = Permission::query()->firstOrCreate(
        ['slug' => 'users.update'],
        ['module' => 'Users', 'name' => 'Update User', 'action' => 'update'],
    );
    $role->permissions()->attach($permission);
    $manager->roles()->attach($role);

    $this->actingAs($manager)
        ->post(route('organizations.users.store', $organizationId), [
            'email' => strtoupper($user->email),
        ])
        ->assertRedirect(route('organizations.show', $organizationId));

    expect($user->fresh()->organizations()->whereKey($organizationId)->exists())->toBeTrue()
        ->and($user->fresh()->organization_id)->toBe($primaryOrganizationId);
});

test('organization detail includes its users and eligible accounts', function () {
    $manager = User::factory()->create(['name' => 'A Manager']);
    $member = User::factory()->create([
        'organization_id' => $manager->organization_id,
        'name' => 'B Member',
    ]);
    $availableUser = User::factory()->create();
    $role = Role::query()->create([
        'name' => 'Organization user manager',
        'slug' => 'organization-user-manager',
    ]);
    $permissions = collect([
        ['slug' => 'organizations.view', 'name' => 'View Organizations', 'module' => 'Organizations', 'action' => 'view'],
        ['slug' => 'users.update', 'name' => 'Update User', 'module' => 'Users', 'action' => 'update'],
    ])->map(fn (array $attributes) => Permission::query()->firstOrCreate(
        ['slug' => $attributes['slug']],
        $attributes,
    ));
    $role->permissions()->attach($permissions->pluck('id')->all());
    $manager->roles()->attach($role);

    $this->actingAs($manager)
        ->get(route('organizations.show', $manager->organization_id))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('organization-settings/organizations/show')
            ->has('users', 2)
            ->where('users.0.id', $manager->id)
            ->where('users.1.id', $member->id)
            ->where('canManageUsers', true));

    expect($member->organization_id)->toBe($manager->organization_id);
});

test('a user can be removed from an organization without losing other memberships', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $user->organizations()->sync([$organization->id, $otherOrganization->id]);
    $user->branches()->sync([$branch->id]);
    $manager = User::factory()->create([
        'organization_id' => $organization->id,
    ]);
    $role = Role::query()->create([
        'name' => 'Organization membership manager',
        'slug' => 'organization-membership-manager',
    ]);
    $permission = Permission::query()->firstOrCreate(
        ['slug' => 'users.update'],
        ['module' => 'Users', 'name' => 'Update User', 'action' => 'update'],
    );
    $role->permissions()->attach($permission);
    $manager->roles()->attach($role);

    $this->actingAs($manager)
        ->delete(route('organizations.users.destroy', [
            'organization' => $organization->id,
            'user' => $user->id,
        ]))
        ->assertRedirect(route('organizations.show', $organization->id));

    $user->refresh();
    expect($user->organization_id)->toBe($otherOrganization->id)
        ->and($user->branch_id)->toBeNull()
        ->and($user->organizations()->whereKey($organization->id)->exists())->toBeFalse()
        ->and($user->organizations()->whereKey($otherOrganization->id)->exists())->toBeTrue()
        ->and($user->branches()->whereKey($branch->id)->exists())->toBeFalse();
});

test('adding an unknown email returns a validation error', function () {
    $manager = User::factory()->create();
    $role = Role::query()->create([
        'name' => 'Organization email manager',
        'slug' => 'organization-email-manager',
    ]);
    $permission = Permission::query()->firstOrCreate(
        ['slug' => 'users.update'],
        ['module' => 'Users', 'name' => 'Update User', 'action' => 'update'],
    );
    $role->permissions()->attach($permission);
    $manager->roles()->attach($role);

    $this->actingAs($manager)
        ->from(route('organizations.show', $manager->organization_id))
        ->post(route('organizations.users.store', $manager->organization_id), [
            'email' => 'missing@example.com',
        ])
        ->assertSessionHasErrors('email');
});

test('user-specific organization assignment route is no longer available', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withoutMiddleware()
        ->get('/users/' . $user->id . '/organization')
        ->assertNotFound();
});