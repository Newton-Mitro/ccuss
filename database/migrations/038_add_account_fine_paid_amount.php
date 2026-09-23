<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('account_fines', function (Blueprint $table): void {
            $table->decimal('paid_amount', 20, 4)->default(0)->after('waived_amount');
        });
    }

    public function down(): void
    {
        Schema::table('account_fines', function (Blueprint $table): void {
            $table->dropColumn('paid_amount');
        });
    }
};