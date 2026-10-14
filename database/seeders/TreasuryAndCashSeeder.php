<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TreasuryAndCashSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->call([
                TreasuryFinancialAccountsSeeder::class,
                TreasuryCashLocationsSeeder::class,
                TreasuryGlMappingSeeder::class,
            ]);
        });

        $this->command?->info('Treasury and cash data seeded.');
    }
}