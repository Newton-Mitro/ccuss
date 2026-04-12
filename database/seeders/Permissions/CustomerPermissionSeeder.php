<?php

namespace Database\Seeders\Permissions;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use Illuminate\Support\Facades\Route;

class CustomerPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $routes = Route::getRoutes();
        $permissions = [];

        // ✅ Target module namespaces
        $namespaces = [
            'App\\CustomerModule\\Controllers\\',
        ];

        // ✅ Action mapping (STANDARD RBAC)
        $map = [
            'index' => 'view',
            'show' => 'view',
            'store' => 'create',
            'create' => 'create',
            'edit' => 'update',
            'update' => 'update',
            'destroy' => 'delete',
        ];


        foreach ($routes as $route) {

            $name = $route->getName();
            $action = $route->getActionName();

            // ❌ Skip invalid routes
            if (!$name || $action === 'Closure')
                continue;
            if (!str_contains($action, '@'))
                continue;

            [$controller, $method] = explode('@', $action);

            // ✅ Namespace filter
            $match = collect($namespaces)->contains(
                fn($ns) => str_starts_with($controller, $ns)
            );

            if (!$match)
                continue;

            // ----------------------------
            // Extract module + normalize action
            // ----------------------------
            $controllerName = class_basename($controller); // e.g. CustomerController
            $module = str_replace('Controller', '', $controllerName);

            // ✅ Apply action mapping
            $actionKey = $map[$method] ?? $method;

            $slug = strtolower($module . '.' . $actionKey);

            // ✅ Prevent duplicates (important!)
            if (isset($permissions[$slug]))
                continue;

            $permissions[$slug] = [
                'module' => ucwords($module),
                'name' => ucwords($module . ' ' . $actionKey),
                'slug' => $slug,
                'action' => $actionKey,
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

        $roleModels = [];

        foreach ($roles as $slug => $name) {
            $roleModels[$slug] = Role::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => "{$name} role"
                ]
            );
        }

        // ----------------------------
        // Assign permissions
        // ----------------------------
        $roleModels['system_administrator']->permissions()->sync(
            Permission::pluck('id')->toArray()
        );

        $roleModels['basic_user']->permissions()->sync(
            Permission::inRandomOrder()->limit(5)->pluck('id')->toArray()
        );

        // ----------------------------
        // Assign user
        // ----------------------------
        if ($user = User::find(1)) {
            $user->roles()->sync([
                $roleModels['system_administrator']->id,
            ]);
        }

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