<?php

namespace Database\Seeders;


use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {


        $this->call([
            OrganizationStructureSeeder::class,
            CustomerSeeder::class,
            InstrumentTypeSeeder::class,
            FiscalYearSeeder::class,
            PermissionSeeder::class,
            ChartOfAccountsSeeder::class,
            RealVoucherEntrySeeder::class
        ]);

    }
}
