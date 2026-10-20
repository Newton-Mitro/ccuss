<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\CashCountService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashDenomination;
use App\TreasuryAndCash\Models\CashLocation;

it('records denomination quantities and calculates the cash count total', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_OPEN, 'opened_at' => now(), 'opened_by' => $user->id]);
    $location = CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'code' => 'VAULT-1', 'name' => 'Main Vault', 'type' => 'VAULT', 'is_active' => true]);
    $note = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'NOTE', 'value' => 100, 'name' => '100 taka', 'is_active' => true]);
    $coin = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'COIN', 'value' => 5, 'name' => '5 taka', 'is_active' => true]);

    $count = app(CashCountService::class)->createCount([
        'branch_day_id' => $branchDay->id,
        'cash_location_id' => $location->id,
        'type' => 'VERIFICATION',
        'denominations' => [
            ['cash_denomination_id' => $note->id, 'quantity' => 3],
            ['cash_denomination_id' => $coin->id, 'quantity' => 2],
        ],
    ], $organization->id, $user->id);

    expect($count->total_amount)->toBe('310.0000')->and($count->denominations)->toHaveCount(2);
});

it('has a bangladesh denomination preset', function () {
    $preset = CashDenomination::bangladeshPreset();

    expect($preset)->toBeArray()
        ->and($preset)->toContainEqual(['currency' => 'BDT', 'type' => 'NOTE', 'value' => 1000, 'name' => '1000 Taka', 'is_active' => true, 'sort_order' => 9])
        ->and($preset)->toContainEqual(['currency' => 'BDT', 'type' => 'COIN', 'value' => 1, 'name' => '1 Taka Coin', 'is_active' => true, 'sort_order' => 12])
        ->and(collect($preset)->pluck('value')->all())->not->toContain(2000)
        ->and(collect($preset)->pluck('value')->all())->not->toContain(5000);
});

it('seeds the bangladesh denominations for every organization idempotently', function () {
    $organizations = Organization::factory()->count(2)->create();

    app(\Database\Seeders\CashDenominationSeeder::class)->run();

    foreach ($organizations as $organization) {
        expect(CashDenomination::query()
            ->where('organization_id', $organization->id)
            ->where('currency', 'BDT')
            ->count())->toBe(count(CashDenomination::bangladeshPreset()));
    }

    app(\Database\Seeders\CashDenominationSeeder::class)->run();

    foreach ($organizations as $organization) {
        expect(CashDenomination::query()
            ->where('organization_id', $organization->id)
            ->where('currency', 'BDT')
            ->count())->toBe(count(CashDenomination::bangladeshPreset()));
    }
});

it('shows denomination setup separately from cash counts', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $role = \App\SystemAdministration\Models\Role::firstOrCreate(
        ['slug' => 'cash_denomination_view_test'],
        ['name' => 'Cash Denomination View Test']
    );
    $permission = \App\SystemAdministration\Models\Permission::firstOrCreate(
        ['slug' => 'cash_transactions.view'],
        ['module' => 'cash_transactions', 'name' => 'View Cash Transactions', 'action' => 'view']
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
    CashDenomination::create([
        'organization_id' => $organization->id,
        'currency' => 'BDT',
        'type' => 'NOTE',
        'value' => 100,
        'name' => '100 Taka',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('cash-denominations.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('treasury-cash/cash-denominations/index')
            ->has('denominations', 1)
            ->where('denominations.0.name', '100 Taka'));
});

it('provides separate organization-scoped create and edit denomination pages', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $role = \App\SystemAdministration\Models\Role::firstOrCreate(
        ['slug' => 'cash_denomination_pages_test'],
        ['name' => 'Cash Denomination Pages Test']
    );
    $permissions = collect(['cash_transactions.create', 'cash_transactions.update'])
        ->map(fn ($slug) => \App\SystemAdministration\Models\Permission::firstOrCreate(
            ['slug' => $slug],
            ['module' => 'cash_transactions', 'name' => $slug, 'action' => str($slug)->afterLast('.')->toString()]
        ));
    $role->permissions()->syncWithoutDetaching($permissions->pluck('id')->all());
    $user->roles()->syncWithoutDetaching([$role->id]);
    $denomination = CashDenomination::create([
        'organization_id' => $organization->id,
        'currency' => 'BDT',
        'type' => 'NOTE',
        'value' => 100,
        'name' => '100 Taka',
        'is_active' => true,
    ]);
    $otherDenomination = CashDenomination::create([
        'organization_id' => $otherOrganization->id,
        'currency' => 'BDT',
        'type' => 'NOTE',
        'value' => 200,
        'name' => '200 Taka',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('cash-denominations.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('treasury-cash/cash-denominations/create')
            ->missing('denomination'));

    $this->get(route('cash-denominations.edit', $denomination))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('treasury-cash/cash-denominations/create')
            ->where('denomination.id', $denomination->id)
            ->where('denomination.count_lines_count', 0));

    $this->get(route('cash-denominations.edit', $otherDenomination))
        ->assertNotFound();
});

it('updates a denomination through the organization-scoped edit endpoint', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $role = \App\SystemAdministration\Models\Role::firstOrCreate(
        ['slug' => 'cash_denomination_update_test'],
        ['name' => 'Cash Denomination Update Test']
    );
    $permission = \App\SystemAdministration\Models\Permission::firstOrCreate(
        ['slug' => 'cash_transactions.update'],
        ['module' => 'cash_transactions', 'name' => 'Update Cash Transactions', 'action' => 'update']
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
    $denomination = CashDenomination::create([
        'organization_id' => $organization->id,
        'currency' => 'BDT',
        'type' => 'NOTE',
        'value' => 100,
        'name' => 'Old name',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->from(route('cash-denominations.index'))
        ->put(route('cash-denominations.update', $denomination), [
            'currency' => 'BDT',
            'type' => 'NOTE',
            'value' => 200,
            'name' => 'Updated name',
            'is_active' => false,
        ])
        ->assertRedirect(route('cash-denominations.index'));

    expect($denomination->fresh()->currency)->toBe('BDT')
        ->and($denomination->fresh()->value)->toBe('200.0000')
        ->and($denomination->fresh()->name)->toBe('Updated name')
        ->and($denomination->fresh()->is_active)->toBeFalse();
});

it('can seed the bangladesh denomination preset through the denomination store flow', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);

    $role = \App\SystemAdministration\Models\Role::firstOrCreate(
        ['slug' => 'cash_count_preset_test'],
        ['name' => 'Cash Count Preset Test']
    );
    $permission = \App\SystemAdministration\Models\Permission::firstOrCreate(
        ['slug' => 'cash_transactions.create'],
        ['module' => 'cash_transactions', 'name' => 'Create Cash Transactions', 'action' => 'create']
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);

    foreach ([2000, 5000] as $value) {
        CashDenomination::create([
            'organization_id' => $organization->id,
            'currency' => 'BDT',
            'type' => 'NOTE',
            'value' => $value,
            'name' => "{$value} Taka",
            'is_active' => true,
        ]);
    }

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->from(route('cash-denominations.index'))
        ->post(route('cash-denominations.store'), ['preset' => 'BANGLADESH'])
        ->assertRedirect(route('cash-denominations.index'));

    expect(CashDenomination::query()->where('organization_id', $organization->id)->where('currency', 'BDT')->where('type', 'NOTE')->whereIn('value', [2000, 5000])->where('is_active', true)->exists())->toBeFalse()
        ->and(CashDenomination::query()->where('organization_id', $organization->id)->where('currency', 'BDT')->where('is_active', true)->count())->toBe(13);
});

it('rejects counts for a closed branch day', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $branchDay = BranchDay::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'business_date' => now()->toDateString(), 'status' => BranchDay::STATUS_CLOSED, 'opened_at' => now(), 'opened_by' => $user->id]);
    $location = CashLocation::create(['organization_id' => $organization->id, 'branch_id' => $branch->id, 'code' => 'VAULT-2', 'name' => 'Closed Vault', 'type' => 'VAULT', 'is_active' => true]);
    $denomination = CashDenomination::create(['organization_id' => $organization->id, 'currency' => 'BDT', 'type' => 'NOTE', 'value' => 100, 'is_active' => true]);

    expect(fn() => app(CashCountService::class)->createCount(['branch_day_id' => $branchDay->id, 'cash_location_id' => $location->id, 'type' => 'CLOSING', 'denominations' => [['cash_denomination_id' => $denomination->id, 'quantity' => 1]]], $organization->id, $user->id))->toThrow(RuntimeException::class, 'open branch day');
});
