<?php

use App\FinancialServices\Application\InterestProvisionService;
use App\FinancialServices\Application\FinancialProductService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\InterestProvision;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\FinancialServices\Application\FinancialTransactionService;

it('stores product rates on the base term instead of financial_products', function () {
    $organization = Organization::factory()->create();
    $product = app(FinancialProductService::class)->create([
        'code' => 'SAV-BASE',
        'name' => 'Savings Base Rate',
        'category' => 'SAVINGS',
        'balance_type' => 'LIABILITY',
        'base_interest_rate' => 7.25,
        'interest_calculation' => 'SIMPLE',
        'interest_frequency' => 'MONTHLY',
    ], $organization->id);

    expect(Schema::hasColumn('financial_products', 'interest_rate'))->toBeFalse()
        ->and((float) $product->baseTerm->interest_rate)->toBe(7.25);
});

it('calculates idempotent interest provisions and supports approval', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
        'balance_type' => 'LIABILITY',
        'interest_frequency' => 'MONTHLY',
    ]);
    $product->baseTerm()->update(['interest_rate' => 12]);
    expect(Schema::hasColumn('financial_products', 'interest_rate'))->toBeFalse();
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
        'balance' => 1000,
        'available_balance' => 1000,
    ]);
    $service = app(InterestProvisionService::class);

    $first = $service->calculateOrganization($organization->id, '2026-01-01', '2026-01-31', $user->id);
    $retry = $service->calculateOrganization($organization->id, '2026-01-01', '2026-01-31', $user->id);

    expect($first)->toHaveCount(1)
        ->and($retry)->toHaveCount(1)
        ->and($first[0]->id)->toBe($retry[0]->id)
        ->and((float) $first[0]->provisioned_amount)->toBe(10.1918);

    expect($service->approve($first[0], $user->id)->status)->toBe('APPROVED');
    $transaction = $service->createPosting($first[0]->fresh(), $organization->id, $user->id);
    app(FinancialTransactionService::class)->post($transaction, $organization->id, $user->id);
    expect($first[0]->fresh()->status)->toBe('POSTED');
    app(FinancialTransactionService::class)->reverse($transaction->fresh(), $organization->id);
    expect($first[0]->fresh()->status)->toBe('REVERSED');
    expect(fn() => $service->approve($first[0]->fresh(), $user->id))
        ->toThrow(RuntimeException::class, 'Only calculated');
    expect(InterestProvision::query()->where('financial_account_id', $account->id)->count())->toBe(1);
});

it('does not calculate interest for another organization', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $product = FinancialProduct::factory()->create([
        'organization_id' => $otherOrganization->id,
        'category' => 'SAVINGS',
        'interest_frequency' => 'MONTHLY',
    ]);
    $product->baseTerm()->update(['interest_rate' => 10]);
    FinancialAccount::factory()->active()->create([
        'organization_id' => $otherOrganization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
        'balance' => 1000,
    ]);

    expect(app(InterestProvisionService::class)->calculateOrganization($organization->id, '2026-01-01', '2026-01-31', 1))->toBeEmpty();
});
