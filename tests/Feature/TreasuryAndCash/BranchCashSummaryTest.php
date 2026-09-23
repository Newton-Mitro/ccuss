<?php

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\BranchCashSummaryService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;

it('calculates an idempotent branch cash summary', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_OPEN, 'opened_at' => now(), 'opened_by' => $user->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'OTHER', 'balance_type' => 'ASSET']);
    $vaultAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'CASH', 'balance' => 700]);
    $tellerAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'CASH', 'balance' => 300]);
    CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_account_id' => $vaultAccount->id, 'code' => 'V-1', 'name' => 'Vault', 'type' => 'VAULT', 'is_active' => true]);
    CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_account_id' => $tellerAccount->id, 'code' => 'T-1', 'name' => 'Teller', 'type' => 'TELLER', 'is_active' => true]);

    $service = app(BranchCashSummaryService::class);
    $first = $service->calculate($branchDay, $organization->id);
    $retry = $service->calculate($branchDay, $organization->id);

    expect($first->id)->toBe($retry->id)
        ->and($first->closing_cash)->toBe('1000.0000')
        ->and($first->cash_difference)->toBe('1000.0000');
});
