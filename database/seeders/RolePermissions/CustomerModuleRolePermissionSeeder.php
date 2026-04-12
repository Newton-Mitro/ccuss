<?php

namespace Database\Seeders\RolePermissions;

use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Permission;

class CustomerModuleRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // =========================
        // ROLE → PERMISSION MATRIX
        // =========================
        $rolePermissions = [

            // =========================
            // SYSTEM ADMIN (FULL ACCESS)
            // =========================
            'system_administrator' => 'ALL',

            // =========================
            // BRANCH MANAGER
            // =========================
            'branch_manager' => [
                'customer.view',
                'customer.create',
                'customer.update',
                'customer.search',

                'customer_address.view',
                'customer_address.create',
                'customer_address.update',

                'customer_family_relation.view',
                'customer_family_relation.create',
                'customer_family_relation.update',
                'customer_family_relation.approve',

                'customer_introducer.view',
                'customer_introducer.create',
                'customer_introducer.update',
                'customer_introducer.approve',

                'customer_kyc_document.view',
                'customer_kyc_document.verify',
                'customer_kyc_document.approve',
            ],

            // =========================
            // TELLER
            // =========================
            'teller' => [
                'customer.view',
                'customer.search',
                'customer_address.view',
            ],

            // =========================
            // CUSTOMER SERVICE
            // =========================
            'customer_service' => [
                'customer.view',
                'customer.search',
                'customer_address.view',
                'customer_family_relation.view',
                'customer_introducer.view',
            ],

            // =========================
            // LOAN OFFICER
            // =========================
            'loan_officer' => [
                'customer.view',
                'customer.search',

                'customer_kyc_document.view',
                'customer_kyc_document.verify',
            ],

            // =========================
            // AUDIT OFFICER
            // =========================
            'audit_officer' => [
                'customer.view',
                'customer.search',

                'customer_kyc_document.view',
                'customer_kyc_document.verify',
                'customer_kyc_document.reject',
            ],

            // =========================
            // HR OFFICER (minimal example)
            // =========================
            'hr_officer' => [
                'customer.view',
            ],

            // =========================
            // BASIC USER
            // =========================
            'basic_user' => [
                'customer.view',
            ],
        ];

        // =========================
        // ASSIGN PERMISSIONS TO ROLES
        // =========================
        foreach ($rolePermissions as $roleSlug => $permissions) {

            $role = Role::where('slug', $roleSlug)->first();

            if (!$role) {
                $this->command->warn("⚠ Role not found: {$roleSlug}");
                continue;
            }

            // =========================
            // FULL ACCESS ROLE
            // =========================
            if ($permissions === 'ALL') {
                $role->permissions()->syncWithoutDetaching(
                    Permission::pluck('id')->toArray()
                );

                $this->command->info("✔ {$roleSlug} granted ALL permissions");
                continue;
            }

            // =========================
            // LIMITED ACCESS ROLES
            // =========================
            $permissionIds = Permission::whereIn('slug', $permissions)
                ->pluck('id')
                ->toArray();

            $role->permissions()->syncWithoutDetaching($permissionIds);

            $this->command->info("✔ {$roleSlug} permissions assigned");
        }

        $this->command->info('✅ Role permissions seeded successfully!');
    }
}