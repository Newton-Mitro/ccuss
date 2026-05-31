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
            'branch_manager' => [
                'customer.view',
                'customer.create',
                'customer.update',
                'customer.search',
            ],
            'teller' => [
                'customer.view',
                'customer.search',
                'customer_address.view',
            ],
            'customer_service' => [
                'customer.view',
                'customer.search',
                'customer_address.view',
                'customer_family_relation.view',
                'customer_introducer.view',
            ],
            'loan_officer' => [
                'customer.view',
                'customer.search',
                'customer_kyc_document.view',
                'customer_kyc_document.verify',
            ],
            'audit_officer' => [
                'customer.view',
                'customer.search',
                'customer_kyc_document.view',
                'customer_kyc_document.verify',
                'customer_kyc_document.reject',
            ],
            'hr_officer' => [
                'customer.view',
            ],
            'basic_user' => [
                'customer.view',
            ],
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