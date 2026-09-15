<?php

namespace Database\Seeders;

use Database\Seeders\SystemAdministratorRolePermissionSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Model::withoutEvents(function () {
            $this->call([
                RoleSeeder::class,
                SystemAdministratorRolePermissionSeeder::class,
                OrganizationStructureSeeder::class,
                CustomerSeeder::class,
            ]);
        });

    }
}
