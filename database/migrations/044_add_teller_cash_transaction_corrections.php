<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('teller_cash_transactions', function (Blueprint $table): void {
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED', 'REVERSED'])->default('PENDING')->change();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reversed_at')->nullable();
            $table->text('reversal_reason')->nullable();
        });
    }

    public function down(): void
    {
        DB::table('teller_cash_transactions')
            ->where('status', 'REVERSED')
            ->update(['status' => 'POSTED']);

        Schema::table('teller_cash_transactions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('cancelled_by');
            $table->dropColumn(['cancelled_at', 'cancellation_reason']);
            $table->dropConstrainedForeignId('reversed_by');
            $table->dropColumn(['reversed_at', 'reversal_reason']);
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING')->change();
        });
    }
};