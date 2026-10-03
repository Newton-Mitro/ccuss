<?php

use App\SystemAdministration\Application\AuditLogService;
use App\SystemAdministration\Application\BranchService;
use App\SystemAdministration\Application\DatabaseBackupService;
use App\SystemAdministration\Application\OrganizationService;
use App\SystemAdministration\Application\RolePermissionService;
use App\SystemAdministration\Application\UserService;
use App\SystemAdministration\Models\AuditLog;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\DatabaseBackupLog;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Database\Seeders\DefaultRolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SystemAdministratorRolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('organization service creates and rejects duplicate codes', function () {
    $service = app(OrganizationService::class);

    $organization = $service->createOrganization([
        'code' => 'ORG-001',
        'name' => 'Alpha Org',
        'short_name' => 'ALPHA',
        'email' => 'alpha@example.com',
        'phone' => '1234567890',
        'country' => 'Bangladesh',
    ]);

    expect($organization)->toBeInstanceOf(Organization::class)
        ->and($organization->code)->toBe('ORG-001');

    expect(fn() => $service->createOrganization([
        'code' => 'ORG-001',
        'name' => 'Duplicate Org',
        'email' => 'duplicate@example.com',
        'phone' => '0987654321',
        'country' => 'Bangladesh',
    ]))->toThrow(RuntimeException::class, 'Organization code already exists.');
});

test('organization service generates a code when one is not provided', function () {
    Organization::factory()->create(['code' => 'ORG-004']);

    $organization = app(OrganizationService::class)->createOrganization([
        'name' => 'Generated Code Org',
    ]);

    expect($organization->code)->toBe('ORG-002');
});

test('organization service replaces logos and deletes the old logo', function () {
    Storage::fake('public');
    $service = app(OrganizationService::class);

    $organization = $service->createOrganization([
        'code' => 'ORG-002',
        'name' => 'Logo Org',
    ], UploadedFile::fake()->image('old-logo.png'));
    $oldPath = $organization->logo_path;

    $updated = $service->updateOrganization(
        $organization,
        ['code' => 'ORG-002', 'name' => 'Updated Logo Org'],
        UploadedFile::fake()->image('new-logo.png'),
    );

    expect($updated->name)->toBe('Updated Logo Org')
        ->and(Storage::disk('public')->exists($oldPath))->toBeFalse()
        ->and(Storage::disk('public')->exists($updated->logo_path))->toBeTrue();

    expect($service->deleteOrganization($updated))->toBeTrue()
        ->and(Storage::disk('public')->exists($updated->logo_path))->toBeFalse();
});

test('branch service creates branches and rejects duplicate codes per organization', function () {
    $organization = Organization::factory()->create([
        'code' => 'ORG-010',
        'name' => 'Branch Org',
    ]);

    $service = app(BranchService::class);

    $branch = $service->createBranch([
        'organization_id' => $organization->id,
        'code' => 'BR-001',
        'name' => 'Dhaka Branch',
        'address' => 'Dhaka',
    ]);

    expect($branch)->toBeInstanceOf(Branch::class)
        ->and($branch->code)->toBe('BR-001');

    expect(fn() => $service->createBranch([
        'organization_id' => $organization->id,
        'code' => 'BR-001',
        'name' => 'Another Dhaka Branch',
        'address' => 'Mirpur',
    ]))->toThrow(RuntimeException::class, 'Branch code already exists for this organization.');
});

test('branch service updates and deletes branches', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
        'code' => 'BR-UPDATE',
    ]);
    $service = app(BranchService::class);

    $updated = $service->updateBranch($branch, [
        'organization_id' => $organization->id,
        'code' => 'BR-UPDATED',
        'name' => 'Updated Branch',
    ]);

    expect($updated->fresh()->name)->toBe('Updated Branch')
        ->and($updated->fresh()->code)->toBe('BR-UPDATED')
        ->and($service->deleteBranch($updated))->toBeTrue()
        ->and(Branch::find($updated->id))->toBeNull();
});

test('user service creates users without assigning a branch and rejects duplicate email addresses', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);

    $service = app(UserService::class);

    $user = $service->createUser([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'name' => 'Test User',
        'email' => 'user@example.com',
        'password' => 'secret123',
        'status' => 'active',
    ]);

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->email)->toBe('user@example.com')
        ->and($user->branch_id)->toBeNull()
        ->and($user->branches()->count())->toBe(0);

    expect(fn() => $service->createUser([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'name' => 'Duplicate User',
        'email' => 'user@example.com',
        'password' => 'secret123',
        'status' => 'inactive',
    ]))->toThrow(RuntimeException::class, 'User email already exists.');
});

test('user service update ignores branch assignment and keeps it separate from user editing', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => null,
    ]);

    $service = app(UserService::class);

    $updatedUser = $service->updateUser($user, [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'branch_id' => $branch->id,
        'status' => 'ACTIVE',
    ]);

    expect($updatedUser->name)->toBe('Updated User')
        ->and($updatedUser->email)->toBe('updated@example.com')
        ->and($updatedUser->branch_id)->toBeNull()
        ->and($updatedUser->branches()->count())->toBe(0);
});

test('user service can assign a user to multiple organizations', function () {
    $organizationOne = Organization::factory()->create(['code' => 'ORG-100']);
    $organizationTwo = Organization::factory()->create(['code' => 'ORG-101']);

    $service = app(UserService::class);

    $user = $service->createUser([
        'organization_id' => $organizationOne->id,
        'organization_ids' => [$organizationOne->id, $organizationTwo->id],
        'name' => 'Multi Org User',
        'email' => 'multi-org@example.com',
        'password' => 'secret123',
        'status' => 'active',
    ]);

    expect($user->organizations()->pluck('organizations.id')->sort()->values()->all())
        ->toBe([$organizationOne->id, $organizationTwo->id])
        ->and($user->organization_id)->toBe($organizationOne->id);

    $updatedUser = $service->updateUser($user, [
        'name' => 'Updated Multi Org User',
        'email' => 'multi-org-updated@example.com',
        'organization_id' => $organizationTwo->id,
        'organization_ids' => [$organizationTwo->id],
    ]);

    expect($updatedUser->organizations()->pluck('organizations.id')->sort()->values()->all())
        ->toBe([$organizationTwo->id])
        ->and($updatedUser->organization_id)->toBe($organizationTwo->id);
});

test('role permission service syncs the selected permissions to a role', function () {
    $role = Role::create([
        'name' => 'Manager',
        'slug' => 'manager',
    ]);

    $permissionOne = Permission::create([
        'name' => 'View dashboard',
        'slug' => 'dashboard.view',
    ]);
    $permissionTwo = Permission::create([
        'name' => 'Update users',
        'slug' => 'users.update',
    ]);

    $service = app(RolePermissionService::class);
    $updatedRole = $service->syncPermissions($role, [$permissionOne->id, $permissionTwo->id]);

    expect($updatedRole->permissions()->pluck('permissions.id')->sort()->values()->all())
        ->toBe([$permissionOne->id, $permissionTwo->id]);
});

test('role seeder creates all requested built-in roles as presets', function () {
    $expectedRoles = [
        'system_administrator' => 'System Administrator',
        'ceo_general_manager' => 'CEO / General Manager',
        'finance_manager' => 'Finance Manager',
        'branch_manager' => 'Branch Manager',
        'assistant_branch_manager' => 'Assistant Branch Manager',
        'accounts_officer' => 'Accounts Officer',
        'internal_auditor' => 'Internal Auditor',
        'member_service_officer' => 'Member Service Officer',
        'teller' => 'Teller',
        'senior_teller' => 'Senior Teller',
        'vault_officer' => 'Vault Officer',
        'loan_officer' => 'Loan Officer',
        'credit_loan_manager' => 'Credit / Loan Manager',
        'recovery_officer' => 'Recovery Officer',
        'deposit_officer' => 'Deposit Officer',
        'hr_payroll_officer' => 'HR & Payroll Officer',
        'compliance_officer' => 'Compliance Officer',
        'report_officer' => 'Report Officer',
        'it_support_officer' => 'IT Support Officer',
    ];

    $this->seed(RoleSeeder::class);

    foreach ($expectedRoles as $slug => $name) {
        $role = Role::where('slug', $slug)->firstOrFail();
        expect($role->name)->toBe($name)->and($role->preset)->toBeTrue();
    }
});

test('role seeder migrates the redundant super administrator role', function () {
    $systemAdministrator = Role::create([
        'name' => 'System Administrator',
        'slug' => 'system_administrator',
        'preset' => true,
    ]);
    $superAdministrator = Role::create([
        'name' => 'Super Administrator',
        'slug' => 'super_administrator',
        'preset' => true,
    ]);
    $user = User::factory()->create();
    $user->roles()->attach($superAdministrator->id);

    $this->seed(RoleSeeder::class);

    expect($user->fresh()->roles()->pluck('roles.id')->all())
        ->toBe([$systemAdministrator->id])
        ->and(Role::withTrashed()->find($superAdministrator->id)->trashed())
        ->toBeTrue();
});

test('default role permissions respect role responsibilities', function () {
    $this->seed(RoleSeeder::class);
    $this->seed(SystemAdministratorRolePermissionSeeder::class);
    $this->seed(DefaultRolePermissionSeeder::class);

    $permissionExists = fn(Role $role, string $slug) => $role->permissions()
        ->where('slug', $slug)
        ->exists();

    $systemAdministrator = Role::where('slug', 'system_administrator')->firstOrFail();
    $teller = Role::where('slug', 'teller')->firstOrFail();
    $branchManager = Role::where('slug', 'branch_manager')->firstOrFail();
    $loanOfficer = Role::where('slug', 'loan_officer')->firstOrFail();
    $creditManager = Role::where('slug', 'credit_loan_manager')->firstOrFail();
    $financeManager = Role::where('slug', 'finance_manager')->firstOrFail();
    $reportOfficer = Role::where('slug', 'report_officer')->firstOrFail();

    expect($systemAdministrator->permissions()->count())->toBe(Permission::count())
        ->and($permissionExists($teller, 'cash_transactions.create'))->toBeTrue()
        ->and($permissionExists($teller, 'cash_transfers.approve'))->toBeFalse()
        ->and($permissionExists($branchManager, 'cash_transfers.approve'))->toBeTrue()
        ->and($permissionExists($loanOfficer, 'financial.loan-applications.create'))->toBeTrue()
        ->and($permissionExists($loanOfficer, 'financial.loan-applications.manage'))->toBeFalse()
        ->and($permissionExists($creditManager, 'financial.loan-applications.manage'))->toBeTrue()
        ->and($permissionExists($financeManager, 'accounting.voucher.post'))->toBeTrue()
        ->and($permissionExists($financeManager, 'accounting.voucher.reverse'))->toBeFalse()
        ->and($permissionExists($reportOfficer, 'accounting.reports.view'))->toBeTrue()
        ->and($permissionExists($reportOfficer, 'accounting.voucher.create'))->toBeFalse();
});

test('custom roles can be created updated and deleted while preset roles are protected', function () {
    $this->withoutMiddleware();
    $this->actingAs(User::factory()->create());

    $response = $this->from(route('roles.index'))->post(route('roles.store'), [
        'name' => 'Cash Manager',
        'slug' => 'cash-manager',
        'description' => 'Manages cash operations',
    ]);

    $role = Role::where('slug', 'cash-manager')->firstOrFail();
    expect($role->preset)->toBeFalse();
    $response->assertRedirect(route('roles.index'));

    $this->put(route('roles.update', $role->id), [
        'name' => 'Senior Cash Manager',
        'slug' => 'senior-cash-manager',
        'description' => 'Manages all cash operations',
    ])->assertRedirect(route('roles.index'));
    expect($role->fresh()->name)->toBe('Senior Cash Manager');

    $assignedUser = User::factory()->create();
    $assignedUser->roles()->attach($role->id);
    $this->delete(route('roles.destroy', $role->id))->assertUnprocessable();
    $assignedUser->roles()->detach($role->id);

    $this->delete(route('roles.destroy', $role->id))
        ->assertRedirect(route('roles.index'));
    expect(Role::withTrashed()->find($role->id)->trashed())->toBeTrue();

    $presetRole = Role::create([
        'name' => 'Preset Role',
        'slug' => 'preset-role',
        'preset' => true,
    ]);

    $this->put(route('roles.update', $presetRole->id), [
        'name' => 'Changed Preset Role',
        'slug' => 'changed-preset-role',
    ])->assertForbidden();
    $this->delete(route('roles.destroy', $presetRole->id))->assertForbidden();
    $this->put(route('roles.update-permissions', $presetRole->id), [
        'permissions' => [],
    ])->assertForbidden();

    expect($presetRole->fresh()->name)->toBe('Preset Role');
});

test('audit log service groups latest events by batch', function () {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();

    AuditLog::create([
        'auditable_type' => Organization::class,
        'auditable_id' => $organization->id,
        'batch_id' => 'batch-1',
        'user_id' => $user->id,
        'event' => 'created',
        'old_values' => null,
        'new_values' => ['id' => $organization->id],
        'url' => '/organizations',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'phpunit',
    ]);

    $service = app(AuditLogService::class);
    $batches = $service->latestBatches();

    expect($batches->isNotEmpty())->toBeTrue()
        ->and($batches->contains(fn($batch) => $batch['batch_id'] === 'batch-1'))->toBeTrue();
});

test('database backup service deletes a backup log and file', function () {
    Storage::fake('backup');
    Storage::disk('backup')->put('2026/Jan/test.sql', 'backup data');

    $log = DatabaseBackupLog::create([
        'file_name' => 'test.sql',
        'file_path' => '2026/Jan/test.sql',
        'file_size' => 12,
        'storage_disk' => 'backup',
        'status' => 'success',
        'created_by' => null,
    ]);

    $service = app(DatabaseBackupService::class);
    $deleted = $service->deleteBackup($log);

    expect($deleted)->toBeTrue()
        ->and(Storage::disk('backup')->exists('2026/Jan/test.sql'))->toBeFalse();
});
