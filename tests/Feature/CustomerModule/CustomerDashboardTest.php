<?php

use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

it('provides organization-scoped demographics, customer statuses, and approval counts for dashboard charts', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $role = Role::firstOrCreate(
        ['slug' => 'customer_dashboard_test'],
        ['name' => 'Customer Dashboard Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'customer.view'],
        [
            'module' => 'customers',
            'name' => 'View Customers',
            'action' => 'view',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
    $createCustomer = fn (int $organizationId, string $number, string $type, ?string $gender, string $status) => Customer::query()->create([
        'organization_id' => $organizationId,
        'customer_no' => $number,
        'type' => $type,
        'name' => $number,
        'identification_type' => $type === Customer::TYPE_ORGANIZATION ? 'REGISTRATION_NO' : 'NATIONAL_IDENTIFICATION_NUMBER',
        'identification_number' => $number,
        'gender' => $gender,
        'status' => $status,
    ]);

    $createCustomer($organization->id, 'CUS-MALE-001', Customer::TYPE_INDIVIDUAL, 'MALE', Customer::STATUS_ACTIVE);
    $createCustomer($organization->id, 'CUS-FEMALE-001', Customer::TYPE_INDIVIDUAL, 'FEMALE', Customer::STATUS_PENDING);
    $createCustomer($organization->id, 'CUS-ORG-001', Customer::TYPE_ORGANIZATION, null, Customer::STATUS_ACTIVE);
    $createCustomer($otherOrganization->id, 'CUS-OTHER-001', Customer::TYPE_INDIVIDUAL, 'MALE', Customer::STATUS_ACTIVE);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('customer-kyc.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('charts.demographics.male', 1)
            ->where('charts.demographics.female', 1)
            ->where('charts.demographics.other', 0)
            ->where('charts.demographics.organization', 1)
            ->where('charts.statuses.active', 2)
            ->where('charts.statuses.pending', 1)
            ->where('charts.pendingApprovals.customers', 1)
            ->where('charts.pendingApprovals.addresses', 0)
            ->where('charts.pendingApprovals.documents', 0)
            ->where('stats.customers', 3));
});
