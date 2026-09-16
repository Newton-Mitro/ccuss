<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table): void {
            $table->boolean('is_cash_account')->default(false)->after('is_reconcilable');
            $table->index(['organization_id', 'is_cash_account']);
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table): void {
            $table->dropIndex(['accounts_organization_id_is_cash_account_index']);
            $table->dropColumn('is_cash_account');
        });
    }
};
