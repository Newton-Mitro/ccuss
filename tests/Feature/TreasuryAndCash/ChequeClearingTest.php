<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\ChequeClearingService;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;

it('moves a presented cheque through clearing and settlement', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_OPEN, 'opened_at' => now(), 'opened_by' => $user->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'OTHER', 'balance_type' => 'ASSET']);
    $financialAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'BANK']);
    $bank = Bank::create(['organization_id' => $organization->id, 'code' => 'CB-1', 'name' => 'Clearing Bank', 'status' => true]);
    $bankAccount = BankAccount::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'bank_id' => $bank->id, 'financial_account_id' => $financialAccount->id, 'account_name' => 'Clearing', 'account_number' => '900', 'status' => 'ACTIVE']);
    $book = ChequeBook::create(['bank_account_id' => $bankAccount->id, 'book_no' => 'BOOK-1', 'start_number' => 1, 'end_number' => 1, 'current_number' => 1, 'leaf_count' => 1, 'status' => 'IN_USE']);
    $cheque = Cheque::create(['cheque_book_id' => $book->id, 'cheque_no' => '1', 'status' => 'PRESENTED', 'amount' => 250, 'presented_date' => now()->toDateString()]);
    $service = app(ChequeClearingService::class);

    $clearing = $service->create(['cheque_id' => $cheque->id, 'branch_id' => $branch->id, 'clearing_no' => 'CLR-1'], $organization->id, $user->id);
    $service->transition($clearing, 'send', $organization->id, $user->id);
    $service->transition($clearing->fresh(), 'present', $organization->id, $user->id);
    $settled = $service->transition($clearing->fresh(), 'settle', $organization->id, $user->id);

    expect($settled->status)->toBe('CLEARED')->and($cheque->fresh()->status)->toBe('CLEARED');
});

it('records a returned clearing and prevents an invalid transition', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_OPEN, 'opened_at' => now(), 'opened_by' => $user->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'OTHER', 'balance_type' => 'ASSET']);
    $financialAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'BANK']);
    $bank = Bank::create(['organization_id' => $organization->id, 'code' => 'CB-2', 'name' => 'Return Bank', 'status' => true]);
    $bankAccount = BankAccount::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'bank_id' => $bank->id, 'financial_account_id' => $financialAccount->id, 'account_name' => 'Returns', 'account_number' => '901', 'status' => 'ACTIVE']);
    $book = ChequeBook::create(['bank_account_id' => $bankAccount->id, 'book_no' => 'BOOK-2', 'start_number' => 1, 'end_number' => 1, 'current_number' => 1, 'leaf_count' => 1, 'status' => 'IN_USE']);
    $cheque = Cheque::create(['cheque_book_id' => $book->id, 'cheque_no' => '1', 'status' => 'PRESENTED', 'amount' => 100, 'presented_date' => now()->toDateString()]);
    $service = app(ChequeClearingService::class);
    $clearing = $service->create(['cheque_id' => $cheque->id, 'branch_id' => $branch->id, 'clearing_no' => 'CLR-2'], $organization->id, $user->id);

    expect(fn() => $service->transition($clearing, 'settle', $organization->id, $user->id))->toThrow(RuntimeException::class, 'cannot transition');
    expect($service->transition($clearing, 'send', $organization->id, $user->id)->status)->toBe('SENT');
    expect($service->transition($clearing->fresh(), 'present', $organization->id, $user->id)->status)->toBe('PRESENTED');
    expect($service->transition($clearing->fresh(), 'bounce', $organization->id, $user->id, 'Insufficient funds')->status)->toBe('RETURNED');
});
