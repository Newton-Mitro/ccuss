<?php

use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
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
