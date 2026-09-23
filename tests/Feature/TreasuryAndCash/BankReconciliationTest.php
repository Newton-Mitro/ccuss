<?php

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\BankReconciliationService;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankTransaction;
use App\TreasuryAndCash\Models\BranchDay;

it('calculates and finalizes a balanced bank reconciliation idempotently', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_OPEN, 'opened_at' => now(), 'opened_by' => $user->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'OTHER', 'balance_type' => 'ASSET']);
    $financialAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'BANK']);
    $bank = Bank::create(['organization_id' => $organization->id, 'code' => 'BANK-1', 'name' => 'Test Bank', 'status' => true]);
    $account = BankAccount::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'bank_id' => $bank->id, 'financial_account_id' => $financialAccount->id, 'account_name' => 'Operating', 'account_number' => '001', 'opening_balance' => 100, 'is_reconcilable' => true, 'status' => 'ACTIVE']);
    BankTransaction::create(['branch_day_id' => $branchDay->id, 'bank_account_id' => $account->id, 'transaction_no' => 'BANK-1', 'type' => 'DEPOSIT', 'amount' => 50, 'transaction_date' => now()->toDateString(), 'status' => 'POSTED']);
    $service = app(BankReconciliationService::class);

    $first = $service->createOrUpdate(['bank_account_id' => $account->id, 'statement_date' => now()->toDateString(), 'statement_balance' => 150], $organization->id);
    $retry = $service->createOrUpdate(['bank_account_id' => $account->id, 'statement_date' => now()->toDateString(), 'statement_balance' => 150], $organization->id);

    expect($first->id)->toBe($retry->id)->and($first->difference)->toBe('0.0000')->and($service->finalize($first, $organization->id, $user->id)->status)->toBe('RECONCILED');
});

it('blocks reconciliation finalization when balances differ', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $bank = Bank::create(['organization_id' => $organization->id, 'code' => 'BANK-2', 'name' => 'Second Bank', 'status' => true]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'OTHER', 'balance_type' => 'ASSET']);
    $financialAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'BANK']);
    $account = BankAccount::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'bank_id' => $bank->id, 'financial_account_id' => $financialAccount->id, 'account_name' => 'Operating 2', 'account_number' => '002', 'opening_balance' => 100, 'is_reconcilable' => true, 'status' => 'ACTIVE']);
    $reconciliation = app(BankReconciliationService::class)->createOrUpdate(['bank_account_id' => $account->id, 'statement_date' => now()->toDateString(), 'statement_balance' => 99], $organization->id);

    expect(fn() => app(BankReconciliationService::class)->finalize($reconciliation, $organization->id, 1))->toThrow(RuntimeException::class, 'difference');
});
