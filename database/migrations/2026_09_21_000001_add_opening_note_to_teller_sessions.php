<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('teller_sessions', function (Blueprint $table): void {
            if (!Schema::hasColumn('teller_sessions', 'opening_note')) {
                $table->text('opening_note')->nullable()->after('opening_cash');
            }
        });
    }

    public function down(): void
    {
        Schema::table('teller_sessions', function (Blueprint $table): void {
            if (Schema::hasColumn('teller_sessions', 'opening_note')) {
                $table->dropColumn('opening_note');
            }
        });
    }
};
