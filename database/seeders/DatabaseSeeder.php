<?php

namespace Database\Seeders;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Model::withoutEvents(function () {
            $this->call([
                OrganizationStructureSeeder::class,
                PermissionSeeder::class,

                CustomerSeeder::class,
                FiscalYearSeeder::class,
                ChartOfAccountsSeeder::class,
                // RealVoucherEntrySeeder::class
            ]);
        });

    }
}
