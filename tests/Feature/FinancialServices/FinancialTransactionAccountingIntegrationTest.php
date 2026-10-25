<?php

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\DepositProductAccountMapping;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
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
use Illuminate\Validation\ValidationException;

it('returns a validation error and leaves a transaction pending when the payout account lacks funds', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $cashAccount = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $organization->id,
        'account_type' => 'CASH',
    ]);
    $loanAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'account_type' => 'LOAN',
    ]);
    $service = app(FinancialTransactionService::class);
    $transaction = $service->createMultiLine(
        [
            'transaction_type' => 'LOAN_DISBURSEMENT',
            'transaction_date' => now()->toDateString(),
            'description' => 'Loan disbursement with insufficient cash',
        ],
        [
            ['financial_account_id' => $loanAccount->id, 'direction' => 'DEBIT', 'amount' => 100000],
            ['financial_account_id' => $cashAccount->id, 'direction' => 'CREDIT', 'amount' => 100000],
        ],
        $organization->id,
        $user->id,
    );

    expect(fn () => $service->post($transaction, $organization->id, $user->id))
        ->toThrow(ValidationException::class, 'does not have enough available balance');

    expect($transaction->fresh()->status)->toBe('PENDING')
        ->and((float) $cashAccount->fresh()->balance)->toBe(500.0)
        ->and((float) $loanAccount->fresh()->balance)->toBe(0.0);
});

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

    expect(fn () => $service->post($transaction->fresh(), $organization->id, $user->id))
        ->toThrow(RuntimeException::class, 'Only pending');

    $service->reverse($transaction->fresh(), $organization->id);
    expect($voucher->fresh()->status)->toBe('REVERSED');
});

it('summarizes a teller cash transaction using one side of its balanced entries', function () {
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
    $cashControlLedger = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'is_control_account' => true,
        'is_cash_account' => true,
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
    $savingsProduct = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
        'balance_type' => 'LIABILITY',
    ]);
    DepositProductAccountMapping::create([
        'deposit_product_id' => $savingsProduct->id,
        'transaction_type' => 'DEPOSIT',
        'debit_account_id' => $debitLedger->id,
        'credit_account_id' => $creditLedger->id,
        'status' => true,
    ]);
    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $savingsProduct->id,
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
        'debit_account_id' => $cashControlLedger->id,
        'credit_account_id' => $debitLedger->id,
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

    expect($transaction->amount)->toBe('250.0000')
        ->and($voucher)->not->toBeNull()
        ->and((float) $voucher->entries->sum('debit'))->toBe(250.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(250.0)
        ->and($voucher->entries->firstWhere('debit', '>', 0)->account_id)->toBe($cashControlLedger->id)
        ->and($voucher->entries->firstWhere('credit', '>', 0)->account_id)->toBe($creditLedger->id);

    DepositProductAccountMapping::create([
        'deposit_product_id' => $savingsProduct->id,
        'transaction_type' => 'WITHDRAWAL',
        'debit_account_id' => $debitLedger->id,
        'credit_account_id' => $creditLedger->id,
        'status' => true,
    ]);
    TreasuryGlMapping::query()->create([
        'organization_id' => $organization->id,
        'source_type' => 'CASH_LOCATION',
        'source_code' => 'TELLER',
        'transaction_type' => 'WITHDRAWAL',
        'debit_account_id' => $creditLedger->id,
        'credit_account_id' => $cashControlLedger->id,
        'status' => true,
    ]);

    $withdrawal = $service->createMultiLine(
        [
            'transaction_type' => 'WITHDRAWAL',
            'transaction_date' => '2026-09-23',
            'description' => 'Teller withdrawal summary',
        ],
        [
            ['financial_account_id' => $cashAccount->id, 'direction' => 'CREDIT', 'amount' => 100],
            ['financial_account_id' => $savingsAccount->id, 'direction' => 'DEBIT', 'amount' => 100],
        ],
        $organization->id,
        $user->id,
        $branch->id,
    );
    $service->post($withdrawal, $organization->id, $user->id);
    $withdrawalVoucher = $withdrawal->fresh()->voucher;

    expect($withdrawalVoucher)->not->toBeNull()
        ->and($withdrawalVoucher->entries->firstWhere('debit', '>', 0)->account_id)->toBe($debitLedger->id)
        ->and($withdrawalVoucher->entries->firstWhere('credit', '>', 0)->account_id)->toBe($cashControlLedger->id);
});
