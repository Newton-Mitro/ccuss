<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('organization_user', function (Blueprint $table): void {
            $table->index('user_id', 'organization_user_user_id_index');
        });

        Schema::table('branch_user', function (Blueprint $table): void {
            $table->index('user_id', 'branch_user_user_id_index');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->foreign('customer_id', 'users_customer_id_foreign')
                ->references('id')
                ->on('customers')
                ->nullOnDelete();
        });

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

        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign('users_customer_id_foreign');
        });

        Schema::table('branch_user', function (Blueprint $table): void {
            $table->dropIndex('branch_user_user_id_index');
        });

        Schema::table('organization_user', function (Blueprint $table): void {
            $table->dropIndex('organization_user_user_id_index');
        });
    }
};