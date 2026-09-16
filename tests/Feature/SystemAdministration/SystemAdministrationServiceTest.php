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
