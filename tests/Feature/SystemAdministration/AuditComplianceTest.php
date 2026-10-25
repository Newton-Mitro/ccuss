<?php

use App\SystemAdministration\Models\AuditComplianceApprovalLog;
use App\SystemAdministration\Models\AuditComplianceRecord;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Database\Seeders\DefaultRolePermissionSeeder;
use Database\Seeders\RoleSeeder;

function grantAuditCompliancePermissions(User $user, array $slugs): void
{
    $role = Role::query()->create([
        'name' => 'Audit Compliance Tester',
        'slug' => 'audit-compliance-tester-'.$user->id,
        'description' => 'Test role',
        'preset' => false,
    ]);

    $permissionIds = collect($slugs)
        ->map(fn (string $slug) => Permission::query()->firstOrCreate(
            ['slug' => $slug],
            [
                'module' => 'Audit & Compliance',
                'name' => $slug,
                'action' => str($slug)->afterLast('.')->toString(),
            ],
        )->id)
        ->all();

    $role->permissions()->sync($permissionIds);
    $user->roles()->attach($role);
}

test('audit register changes create organization-scoped decision history', function () {
    $user = User::factory()->create();
    grantAuditCompliancePermissions($user, [
        'audit-plans.view',
        'audit-plans.create',
        'audit-plans.update',
    ]);

    $this->actingAs($user)->withSession([
        'active_organization_id' => $user->organization_id,
    ])->post(route('audit-plans.store'), [
        'title' => 'Annual control review',
        'status' => 'OPEN',
        'priority' => 'HIGH',
    ])->assertRedirect();

    $record = AuditComplianceRecord::query()
        ->where('organization_id', $user->organization_id)
        ->where('kind', 'AUDIT_PLAN')
        ->sole();

    $this->put(route('audit-plans.update', $record), [
        'title' => 'Annual control review',
        'status' => 'APPROVED',
        'priority' => 'HIGH',
        '_decision_comment' => 'Scope reviewed and approved.',
    ])->assertRedirect(route('audit-plans.show', $record));

    $log = AuditComplianceApprovalLog::query()->sole();

    expect($log->organization_id)->toBe($user->organization_id)
        ->and($log->record_id)->toBe($record->id)
        ->and($log->previous_status)->toBe('OPEN')
        ->and($log->new_status)->toBe('APPROVED')
        ->and($log->comment)->toBe('Scope reviewed and approved.');
});

test('audit registers do not expose records from another organization', function () {
    $user = User::factory()->create();
    grantAuditCompliancePermissions($user, ['audit-plans.view']);
    $record = AuditComplianceRecord::query()->create([
        'organization_id' => \App\SystemAdministration\Models\Organization::factory()->create()->id,
        'kind' => 'AUDIT_PLAN',
        'reference' => 'AUD-OTHER-001',
        'title' => 'Confidential audit plan',
        'status' => 'OPEN',
        'priority' => 'MEDIUM',
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $user->organization_id])
        ->get(route('audit-plans.show', $record))
        ->assertNotFound();
});

test('initial decisions are written to approval history', function () {
    $user = User::factory()->create();
    grantAuditCompliancePermissions($user, ['audit-plans.create']);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $user->organization_id])
        ->post(route('audit-plans.store'), [
            'title' => 'Approved audit plan',
            'status' => 'APPROVED',
            'priority' => 'MEDIUM',
            '_decision_comment' => 'Approved at creation.',
        ])
        ->assertRedirect();

    $log = AuditComplianceApprovalLog::query()->sole();

    expect($log->previous_status)->toBeNull()
        ->and($log->new_status)->toBe('APPROVED')
        ->and($log->comment)->toBe('Approved at creation.');
});

test('audit dashboard summaries are limited to the active organization', function () {
    $user = User::factory()->create();
    grantAuditCompliancePermissions($user, ['internal-audit.view']);

    AuditComplianceRecord::query()->create([
        'organization_id' => $user->organization_id,
        'kind' => 'AUDIT_PLAN',
        'reference' => 'AUD-LOCAL-001',
        'title' => 'Local audit plan',
        'status' => 'OPEN',
        'priority' => 'MEDIUM',
    ]);

    AuditComplianceRecord::query()->create([
        'organization_id' => \App\SystemAdministration\Models\Organization::factory()->create()->id,
        'kind' => 'AUDIT_PLAN',
        'reference' => 'AUD-OTHER-002',
        'title' => 'Other organization audit plan',
        'status' => 'OPEN',
        'priority' => 'HIGH',
    ]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $user->organization_id])
        ->get(route('internal-audit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('audit-compliance/audits/overview-page')
            ->where('summary.total', 1)
            ->where('summary.open', 1)
            ->has('registers', 6)
            ->where('registers.0.count', 1));
});

test('default roles receive audit compliance and regulatory permissions by responsibility', function () {
    $this->seed(RoleSeeder::class);
    $this->seed(DefaultRolePermissionSeeder::class);

    $permissionsFor = fn (string $roleSlug) => Role::query()
        ->where('slug', $roleSlug)
        ->firstOrFail()
        ->permissions()
        ->pluck('slug')
        ->all();

    $auditor = $permissionsFor('internal_auditor');
    $complianceOfficer = $permissionsFor('compliance_officer');
    $reportOfficer = $permissionsFor('report_officer');

    expect($auditor)
        ->toContain('internal-audit.view', 'audit-plans.create', 'audit-follow-ups.delete')
        ->and($complianceOfficer)
        ->toContain('compliance.view', 'compliance-requirements.create', 'risks.view', 'approval-logs.view')
        ->not->toContain('risks.update')
        ->and($reportOfficer)
        ->toContain('regulatory-reports.create', 'regulatory-reports.delete', 'regulatory-report-submissions.update', 'approval-logs.view');
});

test('permission migration grants audit access to existing default roles', function () {
    $this->seed(RoleSeeder::class);

    $migration = require database_path('migrations/047_sync_audit_compliance_role_permissions.php');
    $migration->up();

    $permissionsFor = fn (string $roleSlug) => Role::query()
        ->where('slug', $roleSlug)
        ->firstOrFail()
        ->permissions()
        ->pluck('slug')
        ->all();

    expect($permissionsFor('internal_auditor'))
        ->toContain('internal-audit.view', 'audit-plans.create')
        ->and($permissionsFor('compliance_officer'))
        ->toContain('compliance.view', 'compliance-requirements.create', 'risks.view')
        ->and($permissionsFor('report_officer'))
        ->toContain('regulatory-reports.create', 'regulatory-report-submissions.delete')
        ->and($permissionsFor('system_administrator'))
        ->toContain('approval-logs.view', 'risk-assessments.delete');
});
