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

            // Skip unnamed routes
            if (!$name)
                continue;

            // Example: customers.index → customer.view
            $parts = explode('.', $name);

            if (count($parts) < 2)
                continue;

            $module = $parts[0];
            $action = end($parts);

            if (!$module || !$action)
                continue;

            $slug = "{$module}.{$action}";

            $nameWithoutDash = str_replace('-', ' ', $slug);
            $nameWithoutDash = str_replace('.', ' ', $nameWithoutDash);
            $nameWithoutUnderscore = str_replace('_', ' ', $nameWithoutDash);

            $permissions[$slug] = [
                'module' => ucwords(str_replace(['-', '.', '_'], ' ', $module)),
                'name' => ucwords($nameWithoutUnderscore),
                'slug' => $slug,
                'action' => $action,
                'description' => "Auto generated for {$name}",
            ];
        }

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        // After creating permissions
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'slug' => 'super_admin']);
        $superAdmin->permissions()->sync(Permission::pluck('id')->toArray());

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