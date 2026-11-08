<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loan_repayments', function (Blueprint $table): void {
            $table->decimal('protection_renewal_fee', 20, 2)->default(0)->after('extra_principal_amount');
            $table->date('protection_renewal_date')->nullable()->after('protection_renewal_fee');
        });

        Schema::table('petty_cash_transactions', function (Blueprint $table): void {
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
        DB::table('petty_cash_transactions')
            ->where('status', 'REVERSED')
            ->update(['status' => 'POSTED']);

        Schema::table('petty_cash_transactions', function (Blueprint $table): void {
            $table->dropForeign(['cancelled_by']);
            $table->dropForeign(['reversed_by']);
            $table->dropColumn([
                'cancelled_by',
                'cancelled_at',
                'cancellation_reason',
                'reversed_by',
                'reversed_at',
                'reversal_reason',
            ]);
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING')->change();
        });

        Schema::table('loan_repayments', function (Blueprint $table): void {
            $table->dropColumn(['protection_renewal_fee', 'protection_renewal_date']);
        });
    }
};
