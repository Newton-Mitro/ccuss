<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table): void {
            $table->unsignedInteger('schedule_version')->default(1)->after('loan_account_id');
            $table->json('generation_inputs')->nullable()->after('status');
            $table->index(['loan_account_id', 'schedule_version']);
        });
    }

    public function down(): void
    {
        Schema::table('loan_schedules', function (Blueprint $table): void {
            $table->dropIndex(['loan_account_id', 'schedule_version']);
            $table->dropColumn(['schedule_version', 'generation_inputs']);
        });
    }
};