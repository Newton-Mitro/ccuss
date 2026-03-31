<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use Illuminate\Support\Facades\Route;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $routes = Route::getRoutes();
        $permissions = [];

        foreach ($routes as $route) {

            $name = $route->getName();
            $action = $route->getActionName();

            // ❌ Skip unnamed routes
            if (!$name)
                continue;

            // ❌ Skip Laravel internal / vendor routes
            if (str_contains($action, 'Illuminate\\'))
                continue;
            if (str_contains($action, 'Laravel\\'))
                continue;

            // ❌ Skip debug / system routes
            if (str_starts_with($name, '_'))
                continue;
            if (str_starts_with($name, 'ignition'))
                continue;
            if (str_starts_with($name, 'sanctum'))
                continue;

            // ❌ Skip closure routes (optional but recommended)
            if ($action === 'Closure')
                continue;

            // ✅ Only allow App controllers
            if (!str_starts_with($action, 'App\\'))
                continue;

            // ----------------------------
            // Extract module & action
            // ----------------------------
            $parts = explode('.', $name);

            if (count($parts) < 2)
                continue;

            $module = $parts[0];
            $actionName = end($parts);

            if (!$module || !$actionName)
                continue;

            $slug = "{$module}.{$actionName}";

            // ----------------------------
            // Format names
            // ----------------------------
            $formattedModule = ucwords(str_replace(['-', '_'], ' ', $module));
            $formattedName = ucwords(str_replace(['-', '_', '.'], ' ', $slug));

            $permissions[$slug] = [
                'module' => $formattedModule,
                'name' => $formattedName,
                'slug' => $slug,
                'action' => $actionName,
                'description' => "Auto generated for {$name}",
            ];
        }

        // ----------------------------
        // Insert permissions
        // ----------------------------
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        // ----------------------------
        // Super Admin (full access)
        // ----------------------------
        $superAdmin = Role::firstOrCreate(
            ['slug' => 'system_administrator'],
            [
                'name' => 'System Administrator',
                'description' => 'Full system access with control over all modules, configurations, and permissions.'
            ]
        );
        $branchManager = Role::firstOrCreate(
            ['slug' => 'branch_manager'],
            [
                'name' => 'Branch Manager',
                'description' => 'Oversees branch operations, approvals, and staff management.'
            ]
        );
        $teller = Role::firstOrCreate(
            ['slug' => 'teller'],
            [
                'name' => 'Teller',
                'description' => 'Handles daily cash transactions, deposits, withdrawals, and customer interactions.'
            ]
        );
        $financeOfficer = Role::firstOrCreate(
            ['slug' => 'finance_officer'],
            [
                'name' => 'Finance Officer',
                'description' => 'Manages financial operations, reporting, and fund allocations.'
            ]
        );
        $accountant = Role::firstOrCreate(
            ['slug' => 'accountant'],
            [
                'name' => 'Accountant',
                'description' => 'Maintains financial records, ledgers, and ensures accounting compliance.'
            ]
        );
        $loanOfficer = Role::firstOrCreate(
            ['slug' => 'loan_officer'],
            [
                'name' => 'Loan Officer',
                'description' => 'Processes loan applications, approvals, and customer loan management.'
            ]
        );
        $customerService = Role::firstOrCreate(
            ['slug' => 'customer_service'],
            [
                'name' => 'Customer Service',
                'description' => 'Handles customer inquiries, support, and account-related assistance.'
            ]
        );
        $auditOfficer = Role::firstOrCreate(
            ['slug' => 'audit_officer'],
            [
                'name' => 'Audit Officer',
                'description' => 'Conducts internal audits, ensures compliance, and monitors system integrity.'
            ]
        );
        $hrOfficer = Role::firstOrCreate(
            ['slug' => 'hr_officer'],
            [
                'name' => 'HR Officer',
                'description' => 'Manages employee records, recruitment, and human resource operations.'
            ]
        );
        $marketingOfficer = Role::firstOrCreate(
            ['slug' => 'marketing_officer'],
            [
                'name' => 'Marketing Officer',
                'description' => 'Handles marketing campaigns, promotions, and customer acquisition strategies.'
            ]
        );
        $salesOfficer = Role::firstOrCreate(
            ['slug' => 'sales_officer'],
            [
                'name' => 'Sales Officer',
                'description' => 'Responsible for driving sales, customer onboarding, and product promotion.'
            ]
        );
        $employee = Role::firstOrCreate(
            ['slug' => 'employee'],
            [
                'name' => 'Employee',
                'description' => 'Regular employee with limited access to certain modules.'
            ]
        );
        $basicUser = Role::firstOrCreate(
            ['slug' => 'basic_user'],
            [
                'name' => 'Basic User',
                'description' => 'Limited access user with basic system functionality.'
            ]
        );
        $onlineBanking = Role::firstOrCreate(
            ['slug' => 'online_banking_user'],
            [
                'name' => 'Online Banking User',
                'description' => 'Customer-level access for online banking services such as transfers and account viewing.'
            ]
        );

        $superAdmin->permissions()->sync(
            Permission::pluck('id')->toArray()
        );
        $basicUser->permissions()->sync(
            Permission::inRandomOrder()->limit(5)->pluck('id')->toArray()
        );

        $this->command->info('✅ Clean permissions generated successfully!');
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