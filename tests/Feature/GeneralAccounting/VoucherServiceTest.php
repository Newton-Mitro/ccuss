<?php

use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\Party;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function voucherFixture(): array
{
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $role = Role::firstOrCreate(
        ['slug' => 'accounting_test'],
        ['name' => 'Accounting Test'],
    );
    $role->permissions()->sync([
        Permission::updateOrCreate(
            ['slug' => 'accounting.voucher_entries.view'],
            ['module' => 'accounting_voucher', 'name' => 'View Vouchers', 'action' => 'view'],
        )->id,
        Permission::updateOrCreate(
            ['slug' => 'accounting.voucher.create'],
            ['module' => 'accounting_voucher', 'name' => 'Create Vouchers', 'action' => 'create'],
        )->id,
        Permission::updateOrCreate(
            ['slug' => 'accounting.voucher.update'],
            ['module' => 'accounting_voucher', 'name' => 'Update Vouchers', 'action' => 'update'],
        )->id,
    ]);
    $user->roles()->sync([$role->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);
    $group = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $accounts = [];
    foreach ([['1100', 'Cash'], ['1200', 'Bank']] as [$code, $name]) {
        $accounts[] = app(LedgerAccountService::class)->create([
            'organization_id' => $organization->id,
            'account_group_id' => $group->id,
            'code' => $code,
            'name' => $name,
            'type' => 'ASSET',
            'normal_balance' => 'DEBIT',
            'status' => true,
        ]);
    }

    return compact('organization', 'user', 'fiscalYear', 'period', 'accounts');
}

it('creates a balanced draft voucher with an organization-scoped number', function () {
    $fixture = voucherFixture();

    $voucher = app(VoucherService::class)->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'description' => 'Cash transfer',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);

    expect($voucher)->toBeInstanceOf(Voucher::class)
        ->and($voucher->status)->toBe('DRAFT')
        ->and($voucher->voucher_no)->toBe('JOURNAL-2025-000001')
        ->and($voucher->entries)->toHaveCount(2);
});

it('stores an accounting party on a voucher entry', function () {
    $fixture = voucherFixture();
    $party = Party::query()->create([
        'organization_id' => $fixture['organization']->id,
        'code' => 'SUP-001',
        'name' => 'Office Supplier',
        'party_type' => 'SUPPLIER',
        'status' => true,
    ]);

    $voucher = app(VoucherService::class)->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'party_id' => $party->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);

    expect($voucher->entries)->toHaveCount(2)
        ->and($voucher->entries->first()->party_id)->toBe($party->id)
        ->and($voucher->entries->last()->party_id)->toBeNull();
});

it('allows control ledger entries without a subledger account', function () {
    $fixture = voucherFixture();
    $controlGroup = app(AccountGroupService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'code' => '1300',
        'name' => 'Control Accounts',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $controlAccount = app(LedgerAccountService::class)->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $controlGroup->id,
        'code' => '1301',
        'name' => 'Control Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'is_control_account' => true,
        'status' => true,
    ]);

    $voucher = app(VoucherService::class)->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $controlAccount->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);

    expect($voucher->entries)->toHaveCount(2)
        ->and($voucher->entries->first()->account_id)->toBe($controlAccount->id);
});

it('rejects unbalanced, one-sided, and out-of-period vouchers', function () {
    $fixture = voucherFixture();
    $service = app(VoucherService::class);
    $base = [
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
    ];

    expect(fn() => $service->createDraft($base + [
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 90],
        ]
    ], $fixture['organization']->id, $fixture['user']->id))
        ->toThrow(InvalidArgumentException::class, 'totals must be equal');

    expect(fn() => $service->createDraft($base + [
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 50, 'credit' => 0],
        ]
    ], $fixture['organization']->id, $fixture['user']->id))
        ->toThrow(InvalidArgumentException::class, 'totals must be equal');

    expect(fn() => $service->createDraft(array_merge($base, [
        'voucher_date' => '2026-01-01',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ]), $fixture['organization']->id, $fixture['user']->id))
        ->toThrow(InvalidArgumentException::class, 'within the fiscal period');
});

it('posts a draft and rejects posting it twice', function () {
    $fixture = voucherFixture();
    $service = app(VoucherService::class);
    $voucher = $service->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'PAYMENT',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);

    $posted = $service->post($voucher, $fixture['organization']->id, $fixture['user']->id);

    expect($posted->status)->toBe('POSTED')
        ->and($posted->posted_by)->toBe($fixture['user']->id)
        ->and($posted->posted_at)->not->toBeNull();

    expect(fn() => $service->post($posted, $fixture['organization']->id, $fixture['user']->id))
        ->toThrow(RuntimeException::class, 'Only draft vouchers can be posted');
});

it('cancels drafts and reverses posted vouchers with opposite entries', function () {
    $fixture = voucherFixture();
    $service = app(VoucherService::class);
    $voucher = $service->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 125, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 125],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);

    expect($service->cancel($voucher, $fixture['organization']->id)->status)
        ->toBe('CANCELLED');

    $posted = $service->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-11',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 200, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 200],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $posted = $service->post($posted, $fixture['organization']->id, $fixture['user']->id);

    $reversal = $service->reverse($posted, $fixture['organization']->id, $fixture['user']->id);

    expect($posted->fresh()->status)->toBe('REVERSED')
        ->and($reversal->status)->toBe('POSTED')
        ->and($reversal->voucher_type)->toBe('ADJUSTMENT')
        ->and((float) $reversal->entries[0]->debit)->toBe(0.0)
        ->and((float) $reversal->entries[0]->credit)->toBe(200.0);
});

it('creates a voucher through the organization-scoped HTTP endpoint', function () {
    $fixture = voucherFixture();

    $response = $this
        ->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vouchers.store'), [
            'fiscal_period_id' => $fixture['period']->id,
            'voucher_type' => 'RECEIPT',
            'voucher_date' => '2025-07-15',
            'description' => 'HTTP voucher',
            'entries' => [
                ['account_id' => $fixture['accounts'][0]->id, 'debit' => 300, 'credit' => 0],
                ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 300],
            ],
        ]);

    $response->assertRedirect();
    expect(Voucher::query()
        ->where('organization_id', $fixture['organization']->id)
        ->where('voucher_type', 'RECEIPT')
        ->where('description', 'HTTP voucher')
        ->exists())->toBeTrue();
});

it('provides parties without subledger data to voucher creation', function () {
    $fixture = voucherFixture();
    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vouchers.create', ['type' => 'JOURNAL']))
        ->assertOk()
        ->assertInertia(fn(Assert $page) => $page
            ->component('general-accounting/vouchers/create/journal_voucher_entry_page')
            ->has('parties')
            ->missing('financialAccounts')
            ->missing('cheques'));
});

it('loads accounting parties when editing and viewing a voucher draft', function () {
    $fixture = voucherFixture();
    $branch = Branch::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'name' => 'Test Branch',
    ]);
    $party = Party::query()->create([
        'organization_id' => $fixture['organization']->id,
        'code' => 'MEM-001',
        'name' => 'Accounting Member',
        'party_type' => 'CUSTOMER',
        'status' => true,
    ]);
    $voucher = app(VoucherService::class)->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'description' => 'Edit metadata check',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'party_id' => $party->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucher->update(['branch_id' => $branch->id]);

    $response = $this
        ->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vouchers.edit', $voucher));

    $response->assertOk()->assertInertia(fn(Assert $page) => $page
        ->component('general-accounting/vouchers/edit/voucher_edit_page')
        ->where('voucher.id', $voucher->id)
        ->where('accounts.0.is_control_account', false)
        ->has('parties', 1));

    $this->get(route('vouchers.show', $voucher))
        ->assertOk()
        ->assertInertia(fn(Assert $page) => $page
            ->component('general-accounting/vouchers/show')
            ->where('voucher.branch.name', $branch->name)
            ->where('voucher.entries.0.party.name', $party->name));
});

it('edits draft vouchers and rejects edits to posted vouchers', function () {
    $fixture = voucherFixture();
    $service = app(VoucherService::class);
    $voucher = $service->createDraft([
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'description' => 'Before edit',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $fixture['organization']->id, $fixture['user']->id);
    $voucherNumber = $voucher->voucher_no;

    $updated = $service->updateDraft($voucher, [
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'PAYMENT',
        'voucher_date' => '2025-07-12',
        'description' => 'After edit',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 250, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 250],
        ],
    ], $fixture['organization']->id);

    expect($updated->voucher_no)->toBe($voucherNumber)
        ->and($updated->voucher_type)->toBe('PAYMENT')
        ->and($updated->description)->toBe('After edit')
        ->and((float) $updated->entries[0]->debit)->toBe(250.0);

    $posted = $service->post($updated, $fixture['organization']->id, $fixture['user']->id);

    expect(fn() => $service->updateDraft($posted, [
        'fiscal_period_id' => $fixture['period']->id,
        'voucher_type' => 'PAYMENT',
        'voucher_date' => '2025-07-12',
        'entries' => [
            ['account_id' => $fixture['accounts'][0]->id, 'debit' => 300, 'credit' => 0],
            ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 300],
        ],
    ], $fixture['organization']->id))->toThrow(RuntimeException::class, 'Only draft vouchers can be edited');
});

it('rejects voucher entries that reference another organization account', function () {
    $fixture = voucherFixture();
    $otherOrganization = Organization::factory()->create();
    $otherGroup = app(AccountGroupService::class)->create([
        'organization_id' => $otherOrganization->id,
        'code' => '1000',
        'name' => 'Other Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $otherAccount = app(LedgerAccountService::class)->create([
        'organization_id' => $otherOrganization->id,
        'account_group_id' => $otherGroup->id,
        'code' => '1100',
        'name' => 'Other Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);

    $response = $this
        ->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vouchers.store'), [
            'fiscal_period_id' => $fixture['period']->id,
            'voucher_type' => 'JOURNAL',
            'voucher_date' => '2025-07-15',
            'entries' => [
                ['account_id' => $otherAccount->id, 'debit' => 300, 'credit' => 0],
                ['account_id' => $fixture['accounts'][1]->id, 'debit' => 0, 'credit' => 300],
            ],
        ]);

    $response->assertSessionHasErrors('entries.0.account_id');
    expect(Voucher::query()->where('organization_id', $fixture['organization']->id)->count())->toBe(0);
});
