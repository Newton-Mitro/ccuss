<?php

use App\GeneralAccounting\Application\AccountingReportService;
use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\OpeningBalanceService;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;

it('creates a balanced opening balance voucher for the active period', function () {
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

    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);

    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $voucher = app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 2500],
    ], $organization->id, $user->id, $period->id, $capital->id);

    expect($voucher->voucher_type)->toBe('OPENING')
        ->and($voucher->status)->toBe('POSTED')
        ->and($voucher->entries)->toHaveCount(2)
        ->and((float) $voucher->entries->sum('debit'))->toBe(2500.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(2500.0);
});

it('requires an offset account when creating opening balances', function () {
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

    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);

    expect(fn() => app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 500],
    ], $organization->id, $user->id, $period->id))->toThrow(InvalidArgumentException::class, 'offset account');
});
