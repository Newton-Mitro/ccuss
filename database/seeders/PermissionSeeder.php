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
            // 1. System Administrator / Super Admin
            [
                'slug' => 'super_admin',
                'name' => 'System Administrator',
                'description' => 'Full system access to all modules, settings, and user management.',
                'permissions' => array_values($allPermissions),
            ],

            // 2. Branch Manager
            [
                'slug' => 'branch_manager',
                'name' => 'Branch Manager',
                'description' => 'Manages branch operations including customers, users, cash, and banking.',
                'permissions' => [
                    $allPermissions['customer.view'] ?? null,
                    $allPermissions['customer.create'] ?? null,
                    $allPermissions['user.view'] ?? null,
                    $allPermissions['cash.branch.view'] ?? null,
                    $allPermissions['bank.account.view'] ?? null,
                    $allPermissions['bank.transaction.view'] ?? null,
                    $allPermissions['bank.transaction.approve'] ?? null,
                    $allPermissions['bank.cheque.view'] ?? null,
                    $allPermissions['bank.cheque.approve'] ?? null,
                    $allPermissions['bank.reconcile'] ?? null,
                ],
            ],

            // 3. Teller / Cashier
            [
                'slug' => 'teller',
                'name' => 'Teller / Cashier',
                'description' => 'Handles branch cash operations, deposits, and withdrawals.',
                'permissions' => [
                    $allPermissions['cash.voucher.create'] ?? null,
                    $allPermissions['bank.account.view'] ?? null,
                    $allPermissions['bank.transaction.view'] ?? null,
                ],
            ],

            // 4. Loan Officer / Credit Officer
            [
                'slug' => 'loan_officer',
                'name' => 'Loan / Credit Officer',
                'description' => 'Handles loan applications, approvals, and member credit evaluations.',
                'permissions' => [
                    $allPermissions['customer.view'] ?? null,
                    $allPermissions['customer.create'] ?? null,
                ],
            ],

            // 5. Customer Service
            [
                'slug' => 'customer_service',
                'name' => 'Customer Service',
                'description' => 'Manages member requests and support.',
                'permissions' => [
                    $allPermissions['customer_request.view'] ?? null,
                    $allPermissions['customer_request.respond'] ?? null,
                ],
            ],

            // 6. HR Officer
            [
                'slug' => 'hr_officer',
                'name' => 'HR Officer',
                'description' => 'Manages employee records, leaves, and assignments.',
                'permissions' => [
                    $allPermissions['employee.view'] ?? null,
                    $allPermissions['employee.create'] ?? null,
                    $allPermissions['leave.request'] ?? null,
                    $allPermissions['leave.approve'] ?? null,
                ],
            ],

            // 7. Accountant / Finance Officer
            [
                'slug' => 'accountant',
                'name' => 'Accountant / Finance Officer',
                'description' => 'Handles accounting, treasury, and financial reporting.',
                'permissions' => [
                    $allPermissions['bank.account.view'] ?? null,
                    $allPermissions['bank.transaction.view'] ?? null,
                    $allPermissions['bank.reconcile'] ?? null,
                    $allPermissions['cash.report.view'] ?? null,
                    $allPermissions['payroll.approve'] ?? null,
                ],
            ],

            // 8. Audit Officer
            [
                'slug' => 'audit_officer',
                'name' => 'Audit Officer',
                'description' => 'Audits branch transactions and financial compliance.',
                'permissions' => [
                    $allPermissions['cash.report.view'] ?? null,
                    $allPermissions['bank.reconcile'] ?? null,
                ],
            ],

            // 9. IT Officer
            [
                'slug' => 'it_officer',
                'name' => 'IT Officer',
                'description' => 'Manages IT systems, access, and technical support.',
                'permissions' => [
                    $allPermissions['user.view'] ?? null,
                    $allPermissions['user.edit'] ?? null,
                ],
            ],

            // 10. Online Banking User
            [
                'slug' => 'online_banking_user',
                'name' => 'Online Banking User',
                'description' => 'Limited access for online members to view their accounts and transactions.',
                'permissions' => [
                    $allPermissions['customer.view'] ?? null,
                ],
            ],
        ];

        foreach ($roles as $role) {
            $r = Role::firstOrCreate(['slug' => $role['slug']], ['name' => $role['name'], 'description' => $role['description']]);
            $r->permissions()->sync(array_filter($role['permissions']));
        }

        $this->command->info('✅ Permissions and roles seeded successfully!');
    }
}

// 1. System Administrator / Super Admin
// 2. Branch Manager
// 3. Teller
// 4. Cash Collector
// 5. Cashier
// 6. Treasury / Finance Officer
// 7. Accountant
// 8. Supervisor
// 9. Manager
// 10. Loan Officer / Credit Officer
// 11. Customer Service 
// 12. Audit Officer
// 13. HR Officer
// 14. IT Officer
// 15. Marketing Officer
// 16. Sales Officer
// 17. Operations Officer
// 18. General Manager
// 19. Chief Executive Officer
// 20. Chief Financial Officer
// 21. Chief Operating Officer
// 22. Chief Technology Officer
// 23. Chief Marketing Officer
// 24. Chief Sales Officer
// 25. Chief Operations Officer
// 26. Chief Human Resource Officer
// 27. Online Banking User