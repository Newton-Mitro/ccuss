<?php

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\FinancialTransactionEntry;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

it('shows organization-scoped metrics and weekly activity on the dashboard', function () {
    $organization = Organization::factory()->create();
    Branch::factory()->create(['organization_id' => $organization->id]);

    $otherOrganization = Organization::factory()->create();
    Branch::factory()->create(['organization_id' => $otherOrganization->id]);

    $user = User::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats.branches', 1)
            ->where('organization.activeId', $organization->id)
            ->has('dailyVolume', 7));
});

it('includes financial account numbers in recent dashboard transactions', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $account = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'account_no' => 'TELLER-00001',
        'account_type' => 'CASH',
        'metadata' => ['managed_by' => 'cash_location'],
    ]);
    $transaction = FinancialTransaction::factory()->create([
        'organization_id' => $organization->id,
    ]);
    FinancialTransactionEntry::factory()->create([
        'financial_transaction_id' => $transaction->id,
        'financial_account_id' => $account->id,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('recentTransactions.0.accounts', fn ($accounts) => collect($accounts)->contains('TELLER-00001')));
});
