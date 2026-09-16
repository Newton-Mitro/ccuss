<?php

use App\SystemAdministration\Models\Organization;
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