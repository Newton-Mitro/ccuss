<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialTransaction;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Support\Str;

it('returns the original draft when a transaction is retried with the same idempotency key', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $data = [
        'financial_account_id' => $account->id,
        'transaction_type' => 'WITHDRAWAL',
        'transaction_date' => now()->toDateString(),
        'amount' => 25,
        'idempotency_key' => (string) Str::uuid(),
    ];
    $service = app(FinancialTransactionService::class);

    $first = $service->create($data, $organization->id, $user->id);
    $retry = $service->create($data, $organization->id, $user->id);

    expect($retry->id)->toBe($first->id)
        ->and(FinancialTransaction::query()->where('organization_id', $organization->id)->count())->toBe(1);
});

it('rejects an idempotency key reused for a different transaction', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS']);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
    ]);
    $key = (string) Str::uuid();
    $service = app(FinancialTransactionService::class);
    $service->create([
        'financial_account_id' => $account->id,
        'transaction_type' => 'WITHDRAWAL',
        'transaction_date' => now()->toDateString(),
        'amount' => 25,
        'idempotency_key' => $key,
    ], $organization->id, $user->id);

    expect(fn() => $service->create([
        'financial_account_id' => $account->id,
        'transaction_type' => 'WITHDRAWAL',
        'transaction_date' => now()->toDateString(),
        'amount' => 50,
        'idempotency_key' => $key,
    ], $organization->id, $user->id))->toThrow(RuntimeException::class, 'different transaction');
});
