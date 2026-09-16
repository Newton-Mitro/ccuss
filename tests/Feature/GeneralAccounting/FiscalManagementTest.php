<?php

use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\Voucher;
use App\GeneralAccounting\Models\FiscalYear;
use App\SystemAdministration\Models\Organization;

it('creates organization-scoped fiscal years and keeps one current year', function () {
    $organization = Organization::factory()->create();
    $service = app(FiscalYearService::class);

    $first = $service->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
        'status' => 'OPEN',
        'is_current' => true,
    ]);

    $second = $service->create([
        'organization_id' => $organization->id,
        'name' => '2026-2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
        'status' => 'OPEN',
        'is_current' => true,
    ]);

    expect($second->is_current)->toBeTrue()
        ->and($first->fresh()->is_current)->toBeFalse()
        ->and(FiscalYear::where('organization_id', $organization->id)->count())->toBe(2);
});

it('rejects overlapping fiscal years', function () {
    $organization = Organization::factory()->create();
    $service = app(FiscalYearService::class);

    $service->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);

    expect(fn() => $service->create([
        'organization_id' => $organization->id,
        'name' => 'Overlapping Year',
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]))->toThrow(RuntimeException::class, 'overlaps an existing fiscal year');
});

it('creates periods only inside their fiscal year and rejects overlaps', function () {
    $organization = Organization::factory()->create();
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $service = app(FiscalPeriodService::class);

    $service->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);

    expect(fn() => $service->create($fiscalYear, [
        'name' => 'Overlap',
        'start_date' => '2025-07-15',
        'end_date' => '2025-08-15',
    ]))->toThrow(RuntimeException::class, 'overlaps an existing fiscal period');

    expect(fn() => $service->create($fiscalYear, [
        'name' => 'Outside Year',
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-31',
    ]))->toThrow(InvalidArgumentException::class, 'within its fiscal year');
});

it('prevents deleting a fiscal year that has periods', function () {
    $organization = Organization::factory()->create();
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);

    app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
    ]);

    expect(fn() => app(FiscalYearService::class)->delete($fiscalYear))
        ->toThrow(RuntimeException::class, 'with periods cannot be deleted');
});

it('closes and reopens a fiscal period, and closes a fiscal year only after all periods are closed', function () {
    $organization = Organization::factory()->create();
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
        'status' => 'OPEN',
        'is_current' => true,
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);

    $closed = app(FiscalPeriodService::class)->close($period);
    expect($closed->status)->toBe('CLOSED');

    expect(fn() => app(FiscalPeriodService::class)->close($closed))
        ->toThrow(RuntimeException::class, 'already closed');

    $reopened = app(FiscalPeriodService::class)->reopen($closed);
    expect($reopened->status)->toBe('OPEN');

    $fiscalYear = $reopened->fiscalYear()->first();
    expect(fn() => app(FiscalYearService::class)->closeYear($fiscalYear))
        ->toThrow(RuntimeException::class, 'all periods must be closed');

    $second = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'August 2025',
        'start_date' => '2025-08-01',
        'end_date' => '2025-08-31',
        'status' => 'OPEN',
    ]);

    app(FiscalPeriodService::class)->close($reopened);
    app(FiscalPeriodService::class)->close($second);
    $yearClosed = app(FiscalYearService::class)->closeYear($fiscalYear);

    expect($yearClosed->status)->toBe('CLOSED')
        ->and($yearClosed->periods()->where('status', 'CLOSED')->count())->toBe(2);
});

it('does not close a period or year while draft vouchers remain', function () {
    $organization = Organization::factory()->create();
    $user = \App\SystemAdministration\Models\User::factory()->create(['organization_id' => $organization->id]);
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
    ]);
    $group = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $accounts = collect([['1100', 'Cash'], ['1200', 'Bank']])->map(fn($account) => app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
        'code' => $account[0],
        'name' => $account[1],
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]));

    app(VoucherService::class)->createDraft([
        'fiscal_period_id' => $period->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2025-07-10',
        'entries' => [
            ['account_id' => $accounts[0]->id, 'debit' => 100, 'credit' => 0],
            ['account_id' => $accounts[1]->id, 'debit' => 0, 'credit' => 100],
        ],
    ], $organization->id, $user->id);

    expect(fn() => app(FiscalPeriodService::class)->close($period))
        ->toThrow(RuntimeException::class, 'draft vouchers');
    expect(fn() => app(FiscalYearService::class)->closeYear($fiscalYear))
        ->toThrow(RuntimeException::class, 'all periods must be closed');
});

it('posts a year-end closing voucher before closing the final period and year', function () {
    $organization = Organization::factory()->create();
    $user = \App\SystemAdministration\Models\User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $priorPeriod = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'May 2026',
        'start_date' => '2026-05-01',
        'end_date' => '2026-05-31',
    ]);
    $closingPeriod = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'June 2026',
        'start_date' => '2026-06-01',
        'end_date' => '2026-06-30',
    ]);
    $incomeGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '4000',
        'name' => 'Income',
        'type' => 'INCOME',
        'normal_balance' => 'CREDIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $income = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $incomeGroup->id,
        'code' => '4001',
        'name' => 'Service Income',
        'type' => 'INCOME',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $retainedEarnings = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3200',
        'name' => 'Retained Earnings',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '1100',
        'name' => 'Cash Clearing',
        'type' => 'EQUITY',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    $voucherService = app(VoucherService::class);
    $voucher = $voucherService->createDraft([
        'fiscal_period_id' => $priorPeriod->id,
        'voucher_type' => 'JOURNAL',
        'voucher_date' => '2026-05-15',
        'entries' => [
            ['account_id' => $cash->id, 'debit' => 500, 'credit' => 0],
            ['account_id' => $income->id, 'debit' => 0, 'credit' => 500],
        ],
    ], $organization->id, $user->id);
    $voucherService->post($voucher, $organization->id, $user->id);
    app(FiscalPeriodService::class)->close($priorPeriod);

    $closedYear = app(FiscalYearService::class)->closeYearWithClosingVoucher(
        $fiscalYear,
        $retainedEarnings->id,
        $user->id,
    );
    $closingVoucher = Voucher::query()->where('fiscal_year_id', $fiscalYear->id)->where('voucher_type', 'CLOSING')->first();

    expect($closedYear->status)->toBe('CLOSED')
        ->and($closingPeriod->fresh()->status)->toBe('CLOSED')
        ->and($closingVoucher)->not->toBeNull()
        ->and($closingVoucher->status)->toBe('POSTED')
        ->and((float) $closingVoucher->entries()->sum('debit'))->toBe(500.0)
        ->and((float) $closingVoucher->entries()->sum('credit'))->toBe(500.0);
});
