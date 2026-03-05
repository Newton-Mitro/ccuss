<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstrumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('instrument_types')->insert([
            ['code' => 'CASH', 'name' => 'Cash'],
            ['code' => 'CHEQUE', 'name' => 'Cheque'],
            ['code' => 'BANK_TRANSFER', 'name' => 'Bank Transfer'],
            ['code' => 'MOBILE_BANKING', 'name' => 'Mobile Banking'],
            ['code' => 'CARD', 'name' => 'Card'],
        ]);
    }
}