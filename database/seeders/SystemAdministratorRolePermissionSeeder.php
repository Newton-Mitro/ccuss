<?php

namespace Database\Seeders;

use App\Authorization\PermissionRegistry;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use Illuminate\Database\Seeder;

class SystemAdministratorRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(
            ['slug' => 'system_administrator'],
            [
                'name' => 'System Administrator',
                'description' => 'System Administrator role',
            ],
        );

        $permissionIds = collect(PermissionRegistry::definitions())
            ->map(function ($definition) {
                return Permission::updateOrCreate(
                    ['slug' => $definition->slug],
                    $definition->toArray(),
                )->id;
            })
            ->all();

        $role->permissions()->sync($permissionIds);

        $this->command->info(
            "System Administrator assigned {$role->permissions()->count()} permissions."
        );
    }
}