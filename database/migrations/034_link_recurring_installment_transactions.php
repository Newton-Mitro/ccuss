<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recurring_deposit_installments', function (Blueprint $table): void {
            $table->foreignId('financial_transaction_id')->nullable()->unique()->after('recurring_deposit_id')->constrained('financial_transactions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('recurring_deposit_installments', function (Blueprint $table): void {
            $table->dropForeign(['financial_transaction_id']);
            $table->dropUnique(['financial_transaction_id']);
            $table->dropColumn('financial_transaction_id');
        });
    }
};
