<?php

use App\CustomerModule\Application\CustomerIntroducerService;
use App\CustomerModule\Controllers\CustomerIntroducerController;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerIntroducer;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Http\Request;

it('creates an introducer record and marks it pending', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);

    $introduced = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00010',
        'name' => 'Introduced Customer',
        'primary_phone' => '1111111111',
        'primary_email' => 'introduced@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-111111',
    ]);

    $introducerCustomer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00011',
        'name' => 'Introducer Customer',
        'primary_phone' => '2222222222',
        'primary_email' => 'introducer@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-222222',
    ]);

    $service = app(CustomerIntroducerService::class);

    $record = $service->createIntroducer([
        'introduced_customer_id' => $introduced->id,
        'introducer_customer_id' => $introducerCustomer->id,
        'relationship_type' => 'family',
        'remarks' => 'Introduced by family member',
    ]);

    expect($record)->toBeInstanceOf(CustomerIntroducer::class)
        ->and($record->verification_status)->toBe(CustomerIntroducer::STATUS_PENDING)
        ->and($record->introduced_customer_id)->toBe($introduced->id);
});

it('rejects duplicate introducer combinations', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);

    $introduced = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00012',
        'name' => 'Introduced Customer A',
        'primary_phone' => '3333333333',
        'primary_email' => 'introduceda@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-333333',
    ]);

    $introducerCustomer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00013',
        'name' => 'Introducer Customer A',
        'primary_phone' => '4444444444',
        'primary_email' => 'introducera@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-444444',
    ]);

    CustomerIntroducer::create([
        'introduced_customer_id' => $introduced->id,
        'introducer_customer_id' => $introducerCustomer->id,
        'relationship_type' => 'family',
        'verification_status' => 'pending',
    ]);

    $service = app(CustomerIntroducerService::class);

    expect(fn() => $service->createIntroducer([
        'introduced_customer_id' => $introduced->id,
        'introducer_customer_id' => $introducerCustomer->id,
        'relationship_type' => 'family',
    ]))->toThrow(InvalidArgumentException::class, 'This introducer already exists for the customer.');
});

it('requires valid customer ids and deletes an introducer record', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);

    $introduced = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00014',
        'name' => 'Introduced Customer B',
        'primary_phone' => '5555555555',
        'primary_email' => 'introducedb@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-555555',
    ]);

    $introducerCustomer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00015',
        'name' => 'Introducer Customer B',
        'primary_phone' => '6666666666',
        'primary_email' => 'introducerb@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-666666',
    ]);

    $service = app(CustomerIntroducerService::class);

    expect(fn() => $service->createIntroducer([
        'introduced_customer_id' => 0,
        'introducer_customer_id' => $introducerCustomer->id,
        'relationship_type' => 'family',
    ]))->toThrow(InvalidArgumentException::class, 'A valid introduced customer and introducer customer are required.');

    $record = $service->createIntroducer([
        'introduced_customer_id' => $introduced->id,
        'introducer_customer_id' => $introducerCustomer->id,
        'relationship_type' => 'family',
    ]);

    expect($service->deleteIntroducer($record))->toBeTrue()
        ->and(CustomerIntroducer::withTrashed()->find($record->id))->not->toBeNull();
});

it('renders the introducer index page when searching by introducer customer name', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);

    $introduced = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00016',
        'name' => 'Introduced Search Customer',
        'primary_phone' => '7777777777',
        'primary_email' => 'introduced.search@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-777777',
    ]);

    $introducerCustomer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'customer_no' => 'IND-00017',
        'name' => 'Search Introducer Customer',
        'primary_phone' => '8888888888',
        'primary_email' => 'search.introducer@example.com',
        'identification_type' => 'national_identification_number',
        'identification_number' => 'ID-888888',
    ]);

    CustomerIntroducer::create([
        'introduced_customer_id' => $introduced->id,
        'introducer_customer_id' => $introducerCustomer->id,
        'relationship_type' => 'family',
        'verification_status' => 'pending',
    ]);

    $controller = app(CustomerIntroducerController::class);
    $request = Request::create('/introducers', 'GET', ['search' => 'Search Introducer']);
    $request->attributes->set('active_organization', $organization);
    $response = $controller->index($request);

    expect($response)->toBeInstanceOf(\Inertia\Response::class);
});

it('updates an introducer and rejects duplicate reciprocal relationships', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $introduced = Customer::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $introducer = Customer::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $other = Customer::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);

    $service = app(CustomerIntroducerService::class);
    $record = $service->createIntroducer([
        'introduced_customer_id' => $introduced->id,
        'introducer_customer_id' => $introducer->id,
        'relationship_type' => 'friend',
    ]);
    $service->createIntroducer([
        'introduced_customer_id' => $other->id,
        'introducer_customer_id' => $introducer->id,
        'relationship_type' => 'friend',
    ]);

    expect($service->updateIntroducer($record, ['relationship_type' => 'colleague'])->relationship_type)
        ->toBe('COLLEAGUE');

    expect(fn() => $service->updateIntroducer($record, [
        'introduced_customer_id' => $introducer->id,
        'introducer_customer_id' => $other->id,
    ]))->toThrow(InvalidArgumentException::class, 'This introducer already exists for the customer.');
});
