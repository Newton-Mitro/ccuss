<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

it('links a mapped posted transaction to one voucher and reverses the link', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $group = AccountGroup::factory()->create(['organization_id' => $organization->id]);
    $debit = LedgerAccount::factory()->create(['organization_id' => $organization->id, 'account_group_id' => $group->id]);
    $credit = LedgerAccount::factory()->create(['organization_id' => $organization->id, 'account_group_id' => $group->id]);
    $year = FiscalYear::factory()->create(['organization_id' => $organization->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
    $period = FiscalPeriod::factory()->create(['fiscal_year_id' => $year->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS', 'balance_type' => 'LIABILITY']);
    FinancialProductAccountMapping::create(['financial_product_id' => $product->id, 'transaction_type' => 'DEPOSIT', 'debit_account_id' => $debit->id, 'credit_account_id' => $credit->id, 'status' => true]);
    $account = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'financial_product_id' => $product->id, 'account_type' => 'SAVINGS', 'balance' => 0, 'available_balance' => 0]);
    $service = app(FinancialTransactionService::class);
    $data = ['financial_account_id' => $account->id, 'transaction_type' => 'DEPOSIT', 'transaction_date' => '2026-09-23', 'amount' => 100, 'idempotency_key' => '11111111-1111-4111-8111-111111111111'];

    $transaction = $service->create($data, $organization->id, $user->id);
    $service->post($transaction, $organization->id, $user->id);
    $voucher = $transaction->fresh()->voucher;

    expect($voucher)->not->toBeNull()->and($voucher->entries)->toHaveCount(2)->and(Voucher::query()->where('financial_transaction_id', $transaction->id)->count())->toBe(1);

    expect(fn() => $service->post($transaction->fresh(), $organization->id, $user->id))
        ->toThrow(RuntimeException::class, 'Only pending');

    $service->reverse($transaction->fresh(), $organization->id);
    expect($voucher->fresh()->status)->toBe('REVERSED');
});
