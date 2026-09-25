<?php

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\ChequeBook;

it('allows creating a cheque book for a customer savings account', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);

    $product = FinancialProduct::factory()->create([
        'organization_id' => $organization->id,
        'category' => 'SAVINGS',
        'balance_type' => 'ASSET',
    ]);

    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_product_id' => $product->id,
        'account_type' => 'SAVINGS',
        'holder_type' => User::class,
        'holder_id' => $user->id,
        'account_no' => 'SV-1001',
        'balance' => 5000,
        'available_balance' => 5000,
    ]);

    $book = ChequeBook::create([
        'financial_account_id' => $account->id,
        'book_no' => 'SV-BOOK-01',
        'prefix' => 'SAV',
        'start_number' => 1,
        'end_number' => 5,
        'current_number' => 1,
        'leaf_count' => 5,
        'issued_date' => now()->toDateString(),
        'status' => 'IN_USE',
    ]);

    expect($book->financial_account_id)->toBe($account->id)
        ->and($book->cheques()->count())->toBe(5)
        ->and($book->financialAccount()->first()->id)->toBe($account->id);
});
