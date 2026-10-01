<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('customer_introducers', function (Blueprint $table): void {
            $table->foreign('introducer_account_id', 'customer_introducers_account_id_foreign')
                ->references('id')
                ->on('financial_accounts')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('customer_introducers', function (Blueprint $table): void {
            $table->dropForeign('customer_introducers_account_id_foreign');
        });
    }
};
