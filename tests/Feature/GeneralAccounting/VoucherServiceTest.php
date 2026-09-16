<?php

use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

function voucherFixture(): array
{
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
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
