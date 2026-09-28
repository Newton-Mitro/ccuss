<?php

use App\FinancialServices\Models\AccountDefaultRule;
use App\SystemAdministration\Models\Organization;
use Database\Seeders\AccountDefaultRulesSeeder;

it('seeds inactive account default templates for every organization without overwriting edits', function () {
    $organizations = Organization::factory()->count(2)->create();
    $seeder = new AccountDefaultRulesSeeder;

    $seeder->run();

    foreach ($organizations as $organization) {
        expect(AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->count())->toBe(2);

        $loanRule = AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'LOAN')
            ->firstOrFail();
        $recurringRule = AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'RECURRING_DEPOSIT')
            ->firstOrFail();

        expect($loanRule->is_active)->toBeFalse()
            ->and((float) $loanRule->fine_amount)->toBe(0.0)
            ->and($recurringRule->grace_days)->toBe(7)
            ->and($recurringRule->is_active)->toBeFalse();
    }

    AccountDefaultRule::query()
        ->where('organization_id', $organizations[0]->id)
        ->where('account_type', 'LOAN')
        ->update(['fine_amount' => 25, 'is_active' => true]);

    $seeder->run();

    foreach ($organizations as $organization) {
        expect(AccountDefaultRule::query()
            ->where('organization_id', $organization->id)
            ->count())->toBe(2);
    }

    $customizedLoanRule = AccountDefaultRule::query()
        ->where('organization_id', $organizations[0]->id)
        ->where('account_type', 'LOAN')
        ->firstOrFail();

    expect($customizedLoanRule->is_active)->toBeTrue()
        ->and((float) $customizedLoanRule->fine_amount)->toBe(25.0);
});
