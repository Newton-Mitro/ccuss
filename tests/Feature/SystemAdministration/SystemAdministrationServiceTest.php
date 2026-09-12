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

test('user service creates users and rejects duplicate email addresses', function () {
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
        ->and($user->email)->toBe('user@example.com');

    expect(fn() => $service->createUser([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'name' => 'Duplicate User',
        'email' => 'user@example.com',
        'password' => 'secret123',
        'status' => 'inactive',
    ]))->toThrow(RuntimeException::class, 'User email already exists.');
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
