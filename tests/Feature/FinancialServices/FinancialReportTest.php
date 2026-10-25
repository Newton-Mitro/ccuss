<?php

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
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
        ->assertInertia(fn ($page) => $page
            ->component('financial-services/dashboard')
            ->where('metrics.depositProducts', 1)
            ->where('metrics.loanProducts', 1));
});

it('shows monthly transaction counts for the last six months on the financial dashboard', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $currentMonth = now()->startOfMonth();

    FinancialTransaction::factory()->create([
        'organization_id' => $organization->id,
        'transaction_date' => $currentMonth->copy()->addDays(2),
    ]);
    FinancialTransaction::factory()->posted()->create([
        'organization_id' => $organization->id,
        'transaction_date' => $currentMonth->copy()->addDays(5),
    ]);
    FinancialTransaction::factory()->create([
        'organization_id' => $organization->id,
        'transaction_date' => $currentMonth->copy()->subMonth()->addDays(3),
    ]);
    FinancialTransaction::factory()->create([
        'organization_id' => $organization->id,
        'transaction_date' => $currentMonth->copy()->subMonths(6)->addDays(3),
    ]);
    FinancialTransaction::factory()->create([
        'organization_id' => $otherOrganization->id,
        'transaction_date' => $currentMonth->copy()->addDays(7),
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-services.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('monthlyTransactions', 6)
            ->where('monthlyTransactions.0.label', $currentMonth->copy()->subMonths(5)->format('M Y'))
            ->where('monthlyTransactions.4.count', 1)
            ->where('monthlyTransactions.5.label', $currentMonth->format('M Y'))
            ->where('monthlyTransactions.5.count', 2));
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
        ->assertInertia(fn ($page) => $page
            ->component('financial-services/reports/transactions')
            ->where('transactions.data', fn ($data) => count($data) === 1 && $data[0]['status'] === 'POSTED')
            ->where('transactions.per_page', 1)
            ->where('transactions.total', 1)
            ->where('filters.status', 'POSTED')
            ->where('filters.per_page', '1'));
});

it('shows financial account name and number in account balances report', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'account_no' => 'CASH-001',
        'name' => 'Main Teller Cash',
        'account_type' => 'CASH',
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('financial-reports.account-balances'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('financial-services/reports/account-balances')
            ->where('accounts.data.0.id', $account->id)
            ->where('accounts.data.0.account_no', 'CASH-001')
            ->where('accounts.data.0.name', 'Main Teller Cash'));
});
