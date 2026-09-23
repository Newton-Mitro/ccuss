<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table): void {
            $table->uuid('idempotency_key')->nullable()->after('transaction_no');
            $table->unique(['organization_id', 'idempotency_key'], 'financial_transaction_idempotency_unique');
        });
    }

    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table): void {
            $table->dropUnique('financial_transaction_idempotency_unique');
            $table->dropColumn('idempotency_key');
        });
    }
};
