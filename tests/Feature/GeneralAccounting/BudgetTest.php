<?php

use App\GeneralAccounting\Application\BudgetService;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;

function budgetFixture(): array
{
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $role = Role::firstOrCreate(['slug' => 'budget_test'], ['name' => 'Budget Test']);
    $permissions = [
        'accounting.budgets.view',
        'accounting.budgets.create',
        'accounting.budgets.update',
        'accounting.budgets.delete',
        'accounting.budgets.activate',
        'accounting.budgets.close',
        'accounting.budget_entries.view',
        'accounting.budgets.report',
    ];
    foreach ($permissions as $slug) {
        $permission = Permission::firstOrCreate(
            ['slug' => $slug],
            ['module' => 'accounting_budgets', 'name' => $slug, 'action' => 'view'],
        );
        $role->permissions()->syncWithoutDetaching([$permission->id]);
    }
    $user->roles()->syncWithoutDetaching([$role->id]);

    $fiscalYear = FiscalYear::factory()->create(['organization_id' => $organization->id]);
    $period = FiscalPeriod::factory()->create(['fiscal_year_id' => $fiscalYear->id]);
    $group = AccountGroup::factory()->create(['organization_id' => $organization->id, 'type' => 'EXPENSE', 'normal_balance' => 'DEBIT']);
    $account = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'type' => 'EXPENSE',
        'normal_balance' => 'DEBIT',
    ]);
    $costCenter = CostCenter::factory()->create(['organization_id' => $organization->id]);

    return compact('organization', 'user', 'fiscalYear', 'period', 'account', 'costCenter');
}

function budgetData(array $fixture, string $name = 'Operating Budget'): array
{
    return [
        'organization_id' => $fixture['organization']->id,
        'fiscal_year_id' => $fixture['fiscalYear']->id,
        'name' => $name,
        'entries' => [
            [
                'account_id' => $fixture['account']->id,
                'cost_center_id' => $fixture['costCenter']->id,
                'fiscal_period_id' => $fixture['period']->id,
                'amount' => 1000,
            ]
        ],
    ];
}

it('creates a draft budget with organization-scoped entries', function () {
    $fixture = budgetFixture();
    $budget = app(BudgetService::class)->create(budgetData($fixture));

    expect($budget->status)->toBe('DRAFT')
        ->and($budget->entries)->toHaveCount(1)
        ->and($budget->entries->first()->organization_id)->toBe($fixture['organization']->id);
});

it('enforces the budget lifecycle and prevents a second active budget', function () {
    $fixture = budgetFixture();
    $service = app(BudgetService::class);
    $budget = $service->create(budgetData($fixture));
    $service->activate($budget);

    expect($budget->fresh()->status)->toBe('ACTIVE')
        ->and(fn() => $service->activate($service->create(budgetData($fixture, 'Second Budget'))))
        ->toThrow(RuntimeException::class);

    $service->close($budget->fresh());
    expect($budget->fresh()->status)->toBe('CLOSED')
        ->and(fn() => $service->update($budget->fresh(), budgetData($fixture)))->toThrow(RuntimeException::class);
});

it('rejects duplicate budget dimensions and invalid organizations', function () {
    $fixture = budgetFixture();
    $service = app(BudgetService::class);
    $data = budgetData($fixture);
    $data['entries'][] = $data['entries'][0];

    expect(fn() => $service->create($data))->toThrow(RuntimeException::class);

    $other = Organization::factory()->create();
    $data = budgetData($fixture, 'Invalid Budget');
    $data['entries'][0]['account_id'] = LedgerAccount::factory()->create(['organization_id' => $other->id])->id;

    expect(fn() => $service->create($data))->toThrow(InvalidArgumentException::class);
});

it('loads the budget report for an authorized organization user', function () {
    $fixture = budgetFixture();
    $budget = app(BudgetService::class)->create(budgetData($fixture));
    app(BudgetService::class)->activate($budget);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('financial-reports.budget-vs-actual'))
        ->assertSuccessful()
        ->assertSee('general-accounting/budgets/budget-vs-actual');
});

it('loads the budget entries menu route for an authorized organization user', function () {
    $fixture = budgetFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('budgets.entries'))
        ->assertSuccessful()
        ->assertSee('general-accounting/budgets/entries');
});

it('forbids users without budget permission', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('budgets.index'))
        ->assertForbidden();
});
