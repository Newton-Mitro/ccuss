<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_arrears', function (Blueprint $table): void {
            $table->string('resolution_type', 30)->nullable()->after('status');
            $table->text('resolution_note')->nullable()->after('resolution_type');
            $table->timestamp('resolved_at')->nullable()->after('resolution_note');
            $table->foreignId('resolved_by')->nullable()->after('resolved_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('loan_arrears', function (Blueprint $table): void {
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['resolution_type', 'resolution_note', 'resolved_at', 'resolved_by']);
        });
    }
};