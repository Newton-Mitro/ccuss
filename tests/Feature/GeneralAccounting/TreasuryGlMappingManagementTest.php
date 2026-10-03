<?php

use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function grantTreasuryGlMappingPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'treasury_gl_mapping_test'],
        ['name' => 'Treasury GL Mapping Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'accounting.treasury_mappings.manage'],
        [
            'module' => 'accounting',
            'name' => 'Manage Treasury GL Mappings',
            'action' => 'manage',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('lists and upserts organization-scoped Treasury GL mappings', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    grantTreasuryGlMappingPermission($user);
    $group = AccountGroup::factory()->create(['organization_id' => $organization->id]);
    $debit = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);
    $credit = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);
    $replacementDebit = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('treasury-gl-mappings.index'))
        ->assertOk()
        ->assertInertia(fn(Assert $page) => $page
            ->component('general-accounting/treasury-gl-mappings/index')
            ->has('mappings', 0)
            ->has('accounts', 3));

    $payload = [
        'source_type' => 'BANK_TRANSACTION',
        'source_code' => ' default ',
        'transaction_type' => 'deposit',
        'debit_account_id' => $debit->id,
        'credit_account_id' => $credit->id,
    ];

    $this->post(route('treasury-gl-mappings.store'), $payload)
        ->assertRedirect(route('treasury-gl-mappings.index'));

    $mapping = TreasuryGlMapping::query()->firstOrFail();
    expect($mapping->source_code)->toBe('DEFAULT')
        ->and($mapping->transaction_type)->toBe('DEPOSIT')
        ->and($mapping->debit_account_id)->toBe($debit->id);

    $this->post(route('treasury-gl-mappings.store'), array_merge($payload, [
        'debit_account_id' => $replacementDebit->id,
    ]))->assertRedirect(route('treasury-gl-mappings.index'));

    expect(TreasuryGlMapping::query()->count())->toBe(1)
        ->and($mapping->fresh()->debit_account_id)->toBe($replacementDebit->id);
});

it('rejects Treasury GL mappings to accounts in another organization', function () {
    $organization = Organization::factory()->create();
    $otherOrganization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    grantTreasuryGlMappingPermission($user);
    $group = AccountGroup::factory()->create(['organization_id' => $otherOrganization->id]);
    $otherAccount = LedgerAccount::factory()->create([
        'organization_id' => $otherOrganization->id,
        'account_group_id' => $group->id,
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->from(route('treasury-gl-mappings.index'))
        ->post(route('treasury-gl-mappings.store'), [
            'source_type' => 'BANK_TRANSACTION',
            'source_code' => 'DEFAULT',
            'transaction_type' => 'DEPOSIT',
            'debit_account_id' => $otherAccount->id,
            'credit_account_id' => $otherAccount->id,
        ])
        ->assertRedirect(route('treasury-gl-mappings.index'))
        ->assertSessionHasErrors(['debit_account_id', 'credit_account_id']);

    expect(TreasuryGlMapping::query()->count())->toBe(0);
});
