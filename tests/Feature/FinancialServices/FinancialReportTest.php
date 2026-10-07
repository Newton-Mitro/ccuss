<?php

use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

it('loads the financial services dashboard with split product catalogs', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    DepositProduct::factory()->create(['organization_id' => $organization->id]);
    LoanProduct::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-services.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/dashboard')
            ->where('metrics.depositProducts', 1)
            ->where('metrics.loanProducts', 1));
});

it('filters and paginates the financial transactions report', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    FinancialTransaction::factory()->create(['organization_id' => $organization->id]);
    FinancialTransaction::factory()->posted()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-reports.transactions', [
            'status' => 'POSTED',
            'per_page' => 1,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('financial-services/reports/transactions')
            ->where('transactions.data', fn($data) => count($data) === 1 && $data[0]['status'] === 'POSTED')
            ->where('transactions.per_page', 1)
            ->where('transactions.total', 1)
            ->where('filters.status', 'POSTED')
            ->where('filters.per_page', '1'));
});