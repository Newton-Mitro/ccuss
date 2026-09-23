<?php

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\FinancialServices\Application\FinancialAccountService;
use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;

it('enforces active product deposit limits when creating transactions', function () {
    $organization = Organization::factory()->create();
    Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
    ]);
    FinancialProductPolicy::factory()->create([
        'financial_product_id' => $product->id,
        'minimum_deposit_amount' => 100,
        'maximum_deposit_amount' => 1000,
        'status' => 'ACTIVE',
        'effective_from' => now()->subDay()->toDateString(),
        'effective_until' => null,
    ]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $service = app(FinancialTransactionService::class);
    $data = [
        'financial_account_id' => $account->id,
        'transaction_type' => 'DEPOSIT',
        'transaction_date' => now()->toDateString(),
        'amount' => 50,
    ];

    expect(fn() => $service->create($data, $organization->id, 1))
        ->toThrow(RuntimeException::class, 'below the product minimum');

    $data['amount'] = 1001;
    expect(fn() => $service->create($data, $organization->id, 1))
        ->toThrow(RuntimeException::class, 'exceeds the product maximum');

    $data['amount'] = 500;
    expect($service->create($data, $organization->id, $user->id))->toBeInstanceOf(\App\FinancialServices\Models\FinancialTransaction::class);
});

it('ignores draft product policies during transaction validation', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id]);
    FinancialProductPolicy::factory()->draft()->create([
        'financial_product_id' => $product->id,
        'minimum_deposit_amount' => 10000,
    ]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
    ]);

    $transaction = app(FinancialTransactionService::class)->create([
        'financial_account_id' => $account->id,
        'transaction_type' => 'DEPOSIT',
        'transaction_date' => now()->toDateString(),
        'amount' => 1,
    ], $organization->id, $user->id);

    expect($transaction->status)->toBe('PENDING');
});

it('enforces customer eligibility and verified KYC requirements when opening accounts', function () {
    $organization = Organization::factory()->create();
    Branch::factory()->create(['organization_id' => $organization->id]);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id]);
    FinancialProductPolicy::factory()->create([
        'financial_product_id' => $product->id,
        'eligibility_rules' => ['customer_types' => ['ORGANIZATION']],
        'documentation_requirements' => ['IDENTITY' => true],
        'status' => 'ACTIVE',
        'effective_from' => now()->subDay()->toDateString(),
    ]);

    expect(fn() => app(FinancialAccountService::class)->create([
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'POLICY-ELIGIBILITY-001',
        'account_type' => $product->category,
    ], $organization->id))->toThrow(\Illuminate\Validation\ValidationException::class, 'not eligible');

    $product->policy()->update(['eligibility_rules' => null]);
    expect(fn() => app(FinancialAccountService::class)->create([
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'POLICY-KYC-001',
        'account_type' => $product->category,
    ], $organization->id))->toThrow(\Illuminate\Validation\ValidationException::class, 'KYC');

    KycDocument::factory()->verified()->create([
        'customer_id' => $customer->id,
        'document_type' => KycDocument::NATIONAL_ID,
    ]);

    expect(app(FinancialAccountService::class)->create([
        'financial_product_id' => $product->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'POLICY-KYC-002',
        'account_type' => $product->category,
    ], $organization->id))->toBeInstanceOf(FinancialAccount::class);
});
