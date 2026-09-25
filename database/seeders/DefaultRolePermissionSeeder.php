<?php

namespace Database\Seeders;

use App\Authorization\PermissionRegistry;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use Illuminate\Database\Seeder;

class DefaultRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $rolePermissions = [
            'branch_manager' => [
                'treasury.view',
                'cash_management.view',
                'cash_management.create',
                'cash_management.update',
                'branch_days.view',
                'branch_days.open',
                'branch_days.close',
                'teller_sessions.view',
                'teller_sessions.open',
                'teller_sessions.close',
                'cash_transactions.view',
                'cash_transactions.create',
                'cash_transactions.post',
                'cash_transfers.view',
                'cash_transfers.create',
                'cash_transfers.approve',
                'cash_transfers.complete',
            ],
            'teller' => [
                'treasury.view',
                'cash_management.view',
                'teller_sessions.view',
                'cash_transactions.view',
                'cash_transactions.create',
                'cash_transactions.post',
            ],
            'finance_officer' => [
                'treasury.view',
                'cash_management.view',
                'teller_sessions.view',
                'cash_transactions.view',
                'cash_transactions.create',
                'cash_transactions.post',
                'cash_transfers.view',
                'cash_transfers.create',
                'cash_transfers.approve',
            ],
        ];

        $permissionIds = collect(PermissionRegistry::definitions())
            ->mapWithKeys(fn($definition) => [
                $definition->slug => Permission::firstOrCreate(
                    ['slug' => $definition->slug],
                    $definition->toArray(),
                )->id
            ])
            ->all();

        foreach ($rolePermissions as $slug => $permissions) {
            $role = Role::firstOrCreate(['slug' => $slug], ['name' => ucfirst(str_replace('_', ' ', $slug))]);
            $ids = collect($permissions)
                ->map(fn(string $slugName) => $permissionIds[$slugName] ?? null)
                ->filter()
                ->values()
                ->all();

            $role->permissions()->sync($ids);
        }

        $this->command?->info('Default treasury permissions assigned to standard roles.');
    }
}
