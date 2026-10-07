<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\DepositProductAccountMapping;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\AuditLog;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\CashLocation;

it('links a mapped posted transaction to one voucher and reverses the link', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $group = AccountGroup::factory()->create(['organization_id' => $organization->id]);
    $debit = LedgerAccount::factory()->create(['organization_id' => $organization->id, 'account_group_id' => $group->id]);
    $credit = LedgerAccount::factory()->create(['organization_id' => $organization->id, 'account_group_id' => $group->id]);
    $year = FiscalYear::factory()->create(['organization_id' => $organization->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
    $period = FiscalPeriod::factory()->create(['fiscal_year_id' => $year->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31']);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SAVINGS', 'balance_type' => 'LIABILITY']);
    DepositProductAccountMapping::create(['deposit_product_id' => $product->id, 'transaction_type' => 'DEPOSIT', 'debit_account_id' => $debit->id, 'credit_account_id' => $credit->id, 'status' => true]);
    $account = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'financial_product_id' => $product->id, 'account_type' => 'SAVINGS', 'balance' => 0, 'available_balance' => 0]);
    $service = app(FinancialTransactionService::class);
    $data = ['financial_account_id' => $account->id, 'transaction_type' => 'DEPOSIT', 'transaction_date' => '2026-09-23', 'amount' => 100, 'idempotency_key' => '11111111-1111-4111-8111-111111111111'];

    $transaction = $service->create($data, $organization->id, $user->id);
    $service->post($transaction, $organization->id, $user->id);
    $voucher = $transaction->fresh()->voucher;

    expect($voucher)->not->toBeNull()->and($voucher->entries)->toHaveCount(2)->and(Voucher::query()->where('financial_transaction_id', $transaction->id)->count())->toBe(1);
    expect(AuditLog::query()->where('auditable_type', FinancialTransaction::class)->where('auditable_id', $transaction->id)->where('organization_id', $organization->id)->exists())->toBeTrue()
        ->and(AuditLog::query()->where('auditable_type', Voucher::class)->where('auditable_id', $voucher->id)->where('organization_id', $organization->id)->exists())->toBeTrue();

    expect(fn() => $service->post($transaction->fresh(), $organization->id, $user->id))
        ->toThrow(RuntimeException::class, 'Only pending');

    $service->reverse($transaction->fresh(), $organization->id);
    expect($voucher->fresh()->status)->toBe('REVERSED');
});

it('summarizes a teller cash transaction using its balanced line total', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $group = AccountGroup::factory()->create(['organization_id' => $organization->id]);
    $debitLedger = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);
    $creditLedger = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);
    $year = FiscalYear::factory()->create([
        'organization_id' => $organization->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]);
    FiscalPeriod::factory()->create([
        'fiscal_year_id' => $year->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]);
    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'balance' => 0,
        'available_balance' => 0,
    ]);
    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => null,
        'account_type' => 'SAVINGS',
        'balance' => 0,
        'available_balance' => 0,
    ]);
    CashLocation::query()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_account_id' => $cashAccount->id,
        'code' => 'TELLER-GL-001',
        'name' => 'Teller GL Summary Source',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    TreasuryGlMapping::query()->create([
        'organization_id' => $organization->id,
        'source_type' => 'CASH_LOCATION',
        'source_code' => 'TELLER',
        'transaction_type' => 'DEPOSIT',
        'debit_account_id' => $debitLedger->id,
        'credit_account_id' => $creditLedger->id,
        'status' => true,
    ]);

    $service = app(FinancialTransactionService::class);
    $transaction = $service->createMultiLine(
        [
            'transaction_type' => 'DEPOSIT',
            'transaction_date' => '2026-09-23',
            'description' => 'Teller deposit summary',
        ],
        [
            ['financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT', 'amount' => 250],
            ['financial_account_id' => $savingsAccount->id, 'direction' => 'CREDIT', 'amount' => 250],
        ],
        $organization->id,
        $user->id,
        $branch->id,
    );

    $service->post($transaction, $organization->id, $user->id);
    $voucher = $transaction->fresh()->voucher;

    expect($transaction->amount)->toBe('500.0000')
        ->and($voucher)->not->toBeNull()
        ->and((float) $voucher->entries->sum('debit'))->toBe(250.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(250.0);
});
