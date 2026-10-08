<?php

use App\FinancialServices\Models\AccountDefaultRule;
use App\SystemAdministration\Models\Organization;
use Database\Seeders\AccountDefaultRulesSeeder;

it('seeds active account default rules for every organization without overwriting edits', function () {
    $organizations = Organization::factory()->count(2)->create();
    $seeder = new AccountDefaultRulesSeeder;

    $seeder->run();

    foreach ($organizations as $organization) {
        expect(AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->count())->toBe(4);

        $savingsRule = AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'SAVINGS')
            ->firstOrFail();
        $shareRule = AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'SHARE')
            ->firstOrFail();
        $loanRule = AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'LOAN')
            ->firstOrFail();
        $recurringRule = AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'RECURRING_DEPOSIT')
            ->firstOrFail();

        expect($savingsRule->name)->toBe('Default savings account rule')
            ->and($savingsRule->is_active)->toBeTrue()
            ->and($savingsRule->grace_days)->toBe(0)
            ->and($shareRule->name)->toBe('Default share account rule')
            ->and($shareRule->is_active)->toBeTrue()
            ->and($shareRule->grace_days)->toBe(0)
            ->and($loanRule->is_active)->toBeTrue()
            ->and((float) $loanRule->fine_amount)->toBe(100.0)
            ->and($recurringRule->grace_days)->toBe(7)
            ->and($recurringRule->is_active)->toBeTrue();
    }

    AccountDefaultRule::query()
        ->where('organization_id', $organizations[0]->id)
        ->where('account_type', 'LOAN')
        ->update(['fine_amount' => 25, 'is_active' => true]);

    $seeder->run();

    foreach ($organizations as $organization) {
        expect(AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->count())->toBe(4);
    }

    $customizedLoanRule = AccountDefaultRule::query()
        ->where('organization_id', $organizations[0]->id)
        ->where('account_type', 'LOAN')
        ->firstOrFail();

    expect($customizedLoanRule->is_active)->toBeTrue()
        ->and((float) $customizedLoanRule->fine_amount)->toBe(25.0);
});
