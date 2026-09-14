<?php

namespace Database\Seeders\RolePermissions;

use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Permission;

class CustomerModuleRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $rolePermissions = [
            'system_administrator' => 'ALL',

        ];

        foreach ($rolePermissions as $roleSlug => $permissions) {
            $role = Role::where('slug', $roleSlug)->first();
            if (!$role) {
                $this->command->warn("⚠ Role not found: {$roleSlug}");
                continue;
            }
            if ($permissions === 'ALL') {
                $role->permissions()->syncWithoutDetaching(
                    Permission::pluck('id')->toArray()
                );
                $this->command->info("✔ {$roleSlug} granted ALL permissions");
                continue;
            }
            $permissionIds = Permission::whereIn('slug', $permissions)->pluck('id')->toArray();
            $role->permissions()->syncWithoutDetaching($permissionIds);
            $this->command->info("✔ {$roleSlug} permissions assigned");
        }
        $this->command->info('✅ Role permissions seeded successfully!');
    }
}