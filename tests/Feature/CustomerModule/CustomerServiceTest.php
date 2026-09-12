<?php

use App\CustomerModule\Application\CustomerAddressService;
use App\CustomerModule\Application\CustomerFamilyRelationService;
use App\CustomerModule\Application\CustomerService;
use App\CustomerModule\Application\KycDocumentService;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Http\UploadedFile;

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

test('customer service rejects duplicate identity data on create', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $service = app(CustomerService::class);

    $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'Alice Example',
        'primary_phone' => '9876543210',
        'primary_email' => 'alice.duplicate@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-DUP-001',
        'status' => 'active',
    ]);

    expect(fn() => $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'Alice Duplicate',
        'primary_phone' => '9876543210',
        'primary_email' => 'other@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-DUP-002',
        'status' => 'active',
    ]))->toThrow(RuntimeException::class, 'Duplicate customer detected.');
});

test('customer service updates an existing customer without changing its identity', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $service = app(CustomerService::class);

    $customer = $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'Bob Example',
        'primary_phone' => '5550001111',
        'primary_email' => 'bob@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-UPDATE-001',
        'status' => 'active',
    ]);

    $updated = $service->updateCustomer($customer, [
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'Bob Updated',
        'primary_phone' => '5550002222',
        'primary_email' => 'bob.updated@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-UPDATE-001',
        'status' => 'inactive',
    ]);

    expect($updated)->toBeInstanceOf(Customer::class)
        ->and($updated->name)->toBe('Bob Updated')
        ->and($updated->status)->toBe('inactive')
        ->and($updated->primary_phone)->toBe('5550002222');
});

test('customer service searches and lists matching customers by name and status', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $service = app(CustomerService::class);

    $customer = $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'Charlie Search',
        'primary_phone' => '7770001111',
        'primary_email' => 'charlie.search@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-SEARCH-001',
        'status' => 'active',
    ]);

    $searchResults = $service->searchCustomers('Charlie', 'active');
    $pagedResults = $service->listCustomers('Charlie', 'active', 10);

    expect($searchResults)->toHaveCount(1)
        ->and($searchResults->first()->id)->toBe($customer->id)
        ->and($pagedResults->items())->toHaveCount(1)
        ->and($pagedResults->items()[0]->id)->toBe($customer->id);
});

test('customer service requires at least one contact method and deletes a customer', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $service = app(CustomerService::class);

    expect(fn() => $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'No Contact Customer',
        'primary_phone' => null,
        'primary_email' => null,
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-NO-CONTACT-001',
        'status' => 'active',
    ]))->toThrow(InvalidArgumentException::class, 'Primary phone or email is required.');

    $customer = $service->createCustomer([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'type' => 'individual',
        'name' => 'Delete Me',
        'primary_phone' => '3330004444',
        'primary_email' => 'delete.me@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-DELETE-001',
        'status' => 'active',
    ]);

    expect($service->deleteCustomer($customer))->toBeTrue()
        ->and(Customer::withTrashed()->find($customer->id))->not->toBeNull();
});

test('customer address service rejects duplicate address types per customer', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00020',
        'name' => 'Address Owner',
        'primary_phone' => '1112223333',
        'primary_email' => 'address.owner@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-ADDR-001',
        'status' => 'active',
    ]);

    $service = app(CustomerAddressService::class);

    $service->createAddress([
        'customer_id' => $customer->id,
        'type' => 'current',
        'line1' => 'Main Road',
        'division' => 'Dhaka',
        'district' => 'Dhaka',
        'upazila' => 'Dhanmondi',
        'postal_code' => '1205',
        'country' => 'Bangladesh',
    ]);

    expect(fn() => $service->createAddress([
        'customer_id' => $customer->id,
        'type' => 'current',
        'line1' => 'Second Road',
        'division' => 'Chattogram',
        'district' => 'Chattogram',
        'upazila' => 'Patiya',
        'postal_code' => '4203',
        'country' => 'Bangladesh',
    ]))->toThrow(\InvalidArgumentException::class, 'This customer already has an address of this type.');
});

test('customer family relation service rejects duplicate family links', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00021',
        'name' => 'Family Customer',
        'primary_phone' => '4445556666',
        'primary_email' => 'family.customer@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-FAM-001',
        'status' => 'active',
    ]);

    $relative = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00022',
        'name' => 'Relative Customer',
        'primary_phone' => '4445557777',
        'primary_email' => 'relative.customer@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-FAM-002',
        'status' => 'active',
    ]);

    $service = app(CustomerFamilyRelationService::class);

    $service->createRelation([
        'customer_id' => $customer->id,
        'relative_id' => $relative->id,
        'relation_type' => 'father',
        'verification_status' => 'pending',
    ]);

    expect(fn() => $service->createRelation([
        'customer_id' => $customer->id,
        'relative_id' => $relative->id,
        'relation_type' => 'mother',
        'verification_status' => 'pending',
    ]))->toThrow(\InvalidArgumentException::class, 'This family relation already exists.');
});

test('kyc document service requires a valid customer and can create and delete documents', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00023',
        'name' => 'KYC Customer',
        'primary_phone' => '5558887777',
        'primary_email' => 'kyc.customer@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'NID-KYC-001',
        'status' => 'active',
    ]);

    $service = app(KycDocumentService::class);

    expect(fn() => $service->createDocument(
        UploadedFile::fake()->image('missing-customer.jpg'),
        ['document_type' => 'passport']
    ))->toThrow(\InvalidArgumentException::class, 'A valid customer is required.');

    $document = $service->createDocument(
        UploadedFile::fake()->image('passport.jpg'),
        [
            'customer_id' => $customer->id,
            'document_type' => 'passport',
            'alt_text' => 'Passport image',
        ]
    );

    expect($document)->toBeInstanceOf(KycDocument::class)
        ->and($document->customer_id)->toBe($customer->id)
        ->and($document->document_type)->toBe('passport')
        ->and($document->file_path)->not->toBeNull();

    expect($service->deleteDocument($document))->toBeTrue()
        ->and(KycDocument::find($document->id))->toBeNull();
});
