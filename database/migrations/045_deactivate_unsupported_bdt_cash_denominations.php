<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('cash_denominations')
            ->where('currency', 'BDT')
            ->where('type', 'NOTE')
            ->whereIn('value', [2000, 5000])
            ->update(['is_active' => false]);
    }

    public function down(): void
    {
        // Historical denominations and counts are retained; deactivation is intentional.
    }
};
