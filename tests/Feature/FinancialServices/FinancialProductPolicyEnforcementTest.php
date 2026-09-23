<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

it('enforces active product deposit limits when creating transactions', function () {
    $organization = Organization::factory()->create();
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
