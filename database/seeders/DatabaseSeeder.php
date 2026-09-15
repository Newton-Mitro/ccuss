<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Database\Seeders\SystemAdministratorRolePermissionSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        $user = User::firstOrCreate(
            ['email' => 'super.admin@email.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        Model::withoutEvents(function () {
            $this->call([
                RoleSeeder::class,
                SystemAdministratorRolePermissionSeeder::class,
                OrganizationStructureSeeder::class,
                CustomerSeeder::class,
            ]);
        });

        // Assign role
        $roleModels = Role::where('slug', 'system_administrator')->first();

        if ($roleModels) {
            $user->roles()->sync([$roleModels->id]);
        }

    }
}
