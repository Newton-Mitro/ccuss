<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

it('shows organization-scoped metrics and weekly activity on the dashboard', function () {
    $organization = Organization::factory()->create();
    Branch::factory()->create(['organization_id' => $organization->id]);

    $otherOrganization = Organization::factory()->create();
    Branch::factory()->create(['organization_id' => $otherOrganization->id]);

    $user = User::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('dashboard')
            ->where('stats.branches', 1)
            ->where('organization.activeId', $organization->id)
            ->has('dailyVolume', 7));
});