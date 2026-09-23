<?php

use App\FinancialServices\Application\DividendService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\ShareAccount;
use App\FinancialServices\Models\ShareDividendDeclaration;
use App\GeneralAccounting\Models\FiscalYear;
use App\CustomerModule\Models\Customer;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;

it('calculates idempotent dividends for active share members', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $customer = Customer::factory()->individualMale()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $product = FinancialProduct::factory()->create(['organization_id' => $organization->id, 'category' => 'SHARE', 'balance_type' => 'EQUITY']);
    $account = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'SHARE', 'balance' => 1000, 'available_balance' => 1000]);
    ShareAccount::create(['financial_account_id' => $account->id, 'customer_id' => $customer->id, 'membership_status' => 'ACTIVE', 'member_since' => '2025-01-01']);
    $suspendedAccount = FinancialAccount::factory()->active()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'financial_product_id' => $product->id, 'account_type' => 'SHARE', 'balance' => 500, 'available_balance' => 500]);
    ShareAccount::create(['financial_account_id' => $suspendedAccount->id, 'customer_id' => $customer->id, 'membership_status' => 'SUSPENDED']);
    $fiscalYear = FiscalYear::factory()->create(['organization_id' => $organization->id, 'start_date' => '2025-01-01', 'end_date' => '2025-12-31']);
    $service = app(DividendService::class);
    $declaration = $service->createDeclaration(['fiscal_year_id' => $fiscalYear->id, 'dividend_rate' => 5], $organization->id);

    $calculated = $service->calculate($declaration);
    $retry = $service->calculate($declaration->fresh());

    expect($calculated->allocations)->toHaveCount(1)
        ->and((float) $calculated->total_basis_amount)->toBe(1000.0)
        ->and((float) $calculated->total_dividend_amount)->toBe(50.0)
        ->and($retry->allocations)->toHaveCount(1)
        ->and($service->approve($calculated->fresh(), $user->id)->status)->toBe('APPROVED');
    expect(fn() => $service->createDeclaration(['fiscal_year_id' => $fiscalYear->id, 'dividend_rate' => 4], $organization->id))
        ->toThrow(RuntimeException::class, 'already exists');
});
