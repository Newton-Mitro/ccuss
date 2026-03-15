<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\{Permission, Role};

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------
        // 1. Define permissions with descriptions
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

            // Branch Cash / Petty Cash
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

        // Create permissions
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['slug' => $perm['slug']], $perm);
        }

        // ----------------------------
        // 2. Roles & permission assignments with descriptions
        // ----------------------------

        $roles = [
            // Admin
            ['slug' => 'admin', 'name' => 'Administrator', 'description' => 'Full system access including all modules and permissions.', 'permissions' => Permission::pluck('id')->toArray()],

            // Branch Manager
            [
                'slug' => 'branch_manager',
                'name' => 'Branch Manager',
                'description' => 'Manages branch-level operations including customers, users, cash, and banking.',
                'permissions' => Permission::whereIn('slug', [
                    'customer.view',
                    'customer.create',
                    'user.view',
                    'cash.branch.view',
                    'cash.replenish.approve',
                    'bank.account.view',
                    'bank.transaction.view',
                    'bank.transaction.approve',
                    'bank.cheque.view',
                    'bank.cheque.approve',
                    'bank.reconcile'
                ])->pluck('id')->toArray()
            ],

            // Teller
            [
                'slug' => 'teller',
                'name' => 'Teller',
                'description' => 'Handles branch transactions including deposits, withdrawals, and cash operations.',
                'permissions' => Permission::whereIn('slug', [
                    'cash.branch.view',
                    'cash.voucher.create',
                    'bank.account.view',
                    'bank.transaction.view'
                ])->pluck('id')->toArray()
            ],

            // Cash Officer
            [
                'slug' => 'cash_officer',
                'name' => 'Cash Officer',
                'description' => 'Manages petty cash, vault operations, and branch cash reports.',
                'permissions' => Permission::whereIn('slug', [
                    'cash.branch.view',
                    'cash.voucher.create',
                    'cash.replenish.approve',
                    'cash.report.view'
                ])->pluck('id')->toArray()
            ],

            // Finance Officer
            [
                'slug' => 'finance_officer',
                'name' => 'Finance Officer',
                'description' => 'Responsible for accounting, reconciliations, and financial reporting.',
                'permissions' => Permission::whereIn('slug', [
                    'cash.report.view',
                    'bank.account.view',
                    'bank.transaction.view',
                    'bank.reconcile'
                ])->pluck('id')->toArray()
            ],

            // Auditor
            [
                'slug' => 'auditor',
                'name' => 'Auditor / Supervisor',
                'description' => 'Read-only access for auditing and compliance purposes.',
                'permissions' => Permission::whereIn('slug', [
                    'customer.view',
                    'user.view',
                    'cash.branch.view',
                    'cash.report.view',
                    'bank.account.view',
                    'bank.transaction.view',
                    'bank.cheque.view',
                    'bank.reconcile'
                ])->pluck('id')->toArray()
            ],

            // Payroll Officer
            [
                'slug' => 'payroll_officer',
                'name' => 'Payroll Officer',
                'description' => 'Manages payroll processing, approvals, and employee salary records.',
                'permissions' => Permission::whereIn('slug', [
                    'payroll.view',
                    'payroll.process',
                    'payroll.approve'
                ])->pluck('id')->toArray()
            ],

            // Customer Service
            [
                'slug' => 'customer_service',
                'name' => 'Customer Service',
                'description' => 'Handles customer requests, complaints, and inquiries.',
                'permissions' => Permission::whereIn('slug', [
                    'customer_request.view',
                    'customer_request.respond',
                    'customer.view'
                ])->pluck('id')->toArray()
            ],

            // HR Manager
            [
                'slug' => 'hr_manager',
                'name' => 'HR Manager',
                'description' => 'Manages employee lifecycle, departments, and HR policies.',
                'permissions' => Permission::whereIn('slug', [
                    'employee.view',
                    'employee.create',
                    'employee.edit',
                    'employee.delete',
                    'department.view',
                    'department.edit',
                    'department.assign_employee',
                    'leave.approve'
                ])->pluck('id')->toArray()
            ],

            // Department Head
            [
                'slug' => 'department_head',
                'name' => 'Department Head',
                'description' => 'Oversees departmental operations and approves leave requests.',
                'permissions' => Permission::whereIn('slug', [
                    'employee.view',
                    'department.view',
                    'leave.approve',
                    'task.assign',
                    'task.view'
                ])->pluck('id')->toArray()
            ],

            // Team Lead
            [
                'slug' => 'team_lead',
                'name' => 'Team Lead',
                'description' => 'Supervises team members and assigns tasks.',
                'permissions' => Permission::whereIn('slug', [
                    'employee.view',
                    'task.assign',
                    'task.view'
                ])->pluck('id')->toArray()
            ],

            // Employee
            [
                'slug' => 'employee',
                'name' => 'Employee',
                'description' => 'General staff performing daily work tasks.',
                'permissions' => Permission::whereIn('slug', [
                    'employee.view',
                    'leave.request',
                    'task.view'
                ])->pluck('id')->toArray()
            ],
        ];

        // Create roles & assign permissions
        foreach ($roles as $role) {
            $r = Role::firstOrCreate(['slug' => $role['slug']], ['name' => $role['name'], 'description' => $role['description']]);
            $r->permissions()->sync($role['permissions']);
        }

        $this->command->info('✅ All permissions and roles seeded successfully, including Department & Employee roles');
    }
}