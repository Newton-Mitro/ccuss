<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Role;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------
        // Roles
        // ----------------------------
        $roles = [
            'system_administrator' => 'System Administrator',
            'branch_manager' => 'Branch Manager',
            'teller' => 'Teller',
            'finance_officer' => 'Finance Officer',
            'accountant' => 'Accountant',
            'loan_officer' => 'Loan Officer',
            'customer_service' => 'Customer Service',
            'audit_officer' => 'Audit Officer',
            'hr_officer' => 'HR Officer',
            'marketing_officer' => 'Marketing Officer',
            'sales_officer' => 'Sales Officer',
            'employee' => 'Employee',
            'basic_user' => 'Basic User',
            'online_banking_user' => 'Online Banking User',
        ];

        foreach ($roles as $slug => $name) {
            Role::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => "{$name} role"
                ]
            );
        }

        $this->command->info("✅ Roles created");
    }
}
