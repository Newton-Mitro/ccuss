<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            OrganizationStructureSeeder::class,
            PermissionSeeder::class,

            CustomerSeeder::class,
            InstrumentTypeSeeder::class,
            FiscalYearSeeder::class,

            ChartOfAccountsSeeder::class,
            // RealVoucherEntrySeeder::class
        ]);

    }
}
