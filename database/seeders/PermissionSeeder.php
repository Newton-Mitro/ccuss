<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Permission, Role};

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View Customer', 'slug' => 'customer.view'],
            ['name' => 'Create Customer', 'slug' => 'customer.create'],
            ['name' => 'Edit Customer', 'slug' => 'customer.edit'],
            ['name' => 'Delete Customer', 'slug' => 'customer.delete'],

            ['name' => 'View User', 'slug' => 'user.view'],
            ['name' => 'Edit User', 'slug' => 'user.edit'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['slug' => $perm['slug']], $perm);
        }

        // Admin Role with all permissions
        $admin = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Administrator']);
        $admin->permissions()->sync(Permission::pluck('id'));

        // Manager Role with limited permissions
        $manager = Role::firstOrCreate(['slug' => 'manager'], ['name' => 'Manager']);
        $manager->permissions()->sync(
            Permission::whereIn('slug', ['customer.view', 'customer.create'])->pluck('id')
        );
    }
}