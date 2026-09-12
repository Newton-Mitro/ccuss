<?php

use App\CustomerModule\Application\CustomerService;
use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;

test('customer service creates a customer and kyc profile', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $service = app(CustomerService::class);

    $customer = $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00001',
        'type' => 'individual',
        'name' => 'Alice Example',
        'primary_phone' => '1234567890',
        'primary_email' => 'alice@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-123456',
        'status' => 'active',
    ]);

    expect($customer)->toBeInstanceOf(Customer::class)
        ->and($customer->kycProfile)->not->toBeNull()
        ->and($customer->customer_no)->toBe('IND-00001');
});
