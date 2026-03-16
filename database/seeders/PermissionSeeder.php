<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------
        // 1️⃣ Insert permissions first
        // ----------------------------
        $permissions = [
            // Customers
            ['name' => 'View Customer', 'slug' => 'customer.view', 'description' => 'Allows viewing customer details.'],
            ['name' => 'Create Customer', 'slug' => 'customer.create', 'description' => 'Allows creating new customers.'],
            ['name' => 'Edit Customer', 'slug' => 'customer.edit', 'description' => 'Allows editing customer information.'],
            ['name' => 'Delete Customer', 'slug' => 'customer.delete', 'description' => 'Allows deleting customer records.'],

            // Users
            ['name' => 'View User', 'slug' => 'user.view', 'description' => 'Allows viewing user profiles.'],
            ['name' => 'Edit User', 'slug' => 'user.edit', 'description' => 'Allows editing user accounts.'],

            // Cash / Petty Cash
            ['name' => 'View Petty Cash', 'slug' => 'cash.branch.view', 'description' => 'Allows viewing branch cash management screens.'],
            ['name' => 'Create Petty Cash Voucher', 'slug' => 'cash.voucher.create', 'description' => 'Allows creating petty cash vouchers.'],
            ['name' => 'Approve Petty Cash Replenishment', 'slug' => 'cash.replenish.approve', 'description' => 'Allows approving petty cash replenishment requests.'],
            ['name' => 'View Petty Cash Reports', 'slug' => 'cash.report.view', 'description' => 'Allows viewing petty cash reports.'],

            // Bank Management
            ['name' => 'View Bank Accounts', 'slug' => 'bank.account.view', 'description' => 'Allows viewing bank account information.'],
            ['name' => 'Create Bank Account', 'slug' => 'bank.account.create', 'description' => 'Allows creating new bank accounts.'],
            ['name' => 'Edit Bank Account', 'slug' => 'bank.account.edit', 'description' => 'Allows editing bank account information.'],
            ['name' => 'View Bank Transactions', 'slug' => 'bank.transaction.view', 'description' => 'Allows viewing bank transactions.'],
            ['name' => 'Approve Bank Transactions', 'slug' => 'bank.transaction.approve', 'description' => 'Allows approving bank transactions.'],
            ['name' => 'View Bank Cheques', 'slug' => 'bank.cheque.view', 'description' => 'Allows viewing bank cheque information.'],
            ['name' => 'Approve Bank Cheques', 'slug' => 'bank.cheque.approve', 'description' => 'Allows approving bank cheques.'],
            ['name' => 'Bank Reconciliation', 'slug' => 'bank.reconcile', 'description' => 'Allows performing bank reconciliations.'],

            // Payroll
            ['name' => 'View Payroll', 'slug' => 'payroll.view', 'description' => 'Allows viewing payroll records.'],
            ['name' => 'Process Payroll', 'slug' => 'payroll.process', 'description' => 'Allows processing employee payroll.'],
            ['name' => 'Approve Payroll', 'slug' => 'payroll.approve', 'description' => 'Allows approving payroll for release.'],

            // Customer Service
            ['name' => 'View Customer Requests', 'slug' => 'customer_request.view', 'description' => 'Allows viewing customer service requests.'],
            ['name' => 'Respond Customer Requests', 'slug' => 'customer_request.respond', 'description' => 'Allows responding to customer inquiries and requests.'],

            // Employee & Department
            ['name' => 'View Employee', 'slug' => 'employee.view', 'description' => 'Allows viewing employee profiles.'],
            ['name' => 'Create Employee', 'slug' => 'employee.create', 'description' => 'Allows creating new employee records.'],
            ['name' => 'Edit Employee', 'slug' => 'employee.edit', 'description' => 'Allows editing employee information.'],
            ['name' => 'Delete Employee', 'slug' => 'employee.delete', 'description' => 'Allows deleting employee records.'],
            ['name' => 'View Department', 'slug' => 'department.view', 'description' => 'Allows viewing department details.'],
            ['name' => 'Edit Department', 'slug' => 'department.edit', 'description' => 'Allows editing department information.'],
            ['name' => 'Assign Employee to Department', 'slug' => 'department.assign_employee', 'description' => 'Allows assigning employees to a department.'],
            ['name' => 'Submit Leave Request', 'slug' => 'leave.request', 'description' => 'Allows submitting leave requests.'],
            ['name' => 'Approve Leave Request', 'slug' => 'leave.approve', 'description' => 'Allows approving leave requests.'],
            ['name' => 'Assign Task', 'slug' => 'task.assign', 'description' => 'Allows assigning tasks to employees.'],
            ['name' => 'View Task', 'slug' => 'task.view', 'description' => 'Allows viewing assigned tasks.'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['slug' => $perm['slug']], $perm);
        }

        // ----------------------------
        // 2️⃣ Fetch permissions again to ensure IDs exist
        // ----------------------------
        $allPermissions = Permission::pluck('id', 'slug')->toArray();

        // ----------------------------
        // 3️⃣ Roles with assigned permissions
        // ----------------------------
        $roles = [
            ['slug' => 'admin', 'name' => 'Administrator', 'description' => 'Full system access including all modules and permissions.', 'permissions' => array_values($allPermissions)],
            [
                'slug' => 'branch_manager',
                'name' => 'Branch Manager',
                'description' => 'Manages branch-level operations including customers, users, cash, and banking.',
                'permissions' => [
                    $allPermissions['customer.view'] ?? null,
                    $allPermissions['customer.create'] ?? null,
                    $allPermissions['user.view'] ?? null,
                    $allPermissions['cash.branch.view'] ?? null,
                    $allPermissions['cash.replenish.approve'] ?? null,
                    $allPermissions['bank.account.view'] ?? null,
                    $allPermissions['bank.transaction.view'] ?? null,
                    $allPermissions['bank.transaction.approve'] ?? null,
                    $allPermissions['bank.cheque.view'] ?? null,
                    $allPermissions['bank.cheque.approve'] ?? null,
                    $allPermissions['bank.reconcile'] ?? null,
                ]
            ],
            [
                'slug' => 'teller',
                'name' => 'Teller',
                'description' => 'Handles branch transactions including deposits, withdrawals, and cash operations.',
                'permissions' => [
                    $allPermissions['cash.branch.view'] ?? null,
                    $allPermissions['cash.voucher.create'] ?? null,
                    $allPermissions['bank.account.view'] ?? null,
                    $allPermissions['bank.transaction.view'] ?? null,
                ]
            ],
            // add other roles similarly...
        ];

        foreach ($roles as $role) {
            $r = Role::firstOrCreate(['slug' => $role['slug']], ['name' => $role['name'], 'description' => $role['description']]);
            $r->permissions()->sync(array_filter($role['permissions']));
        }

        $this->command->info('✅ Permissions and roles seeded successfully!');
    }
}