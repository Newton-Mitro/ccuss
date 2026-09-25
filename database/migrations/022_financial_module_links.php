<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vouchers', function (Blueprint $table): void {
            $table->foreign('financial_transaction_id')
                ->references('id')
                ->on('financial_transactions')
                ->nullOnDelete();
        });

        if (!Schema::hasColumn('accounts', 'is_cash_account')) {
            Schema::table('accounts', function (Blueprint $table): void {
                $table->boolean('is_cash_account')->default(false)->after('is_reconcilable');
            });
        }

        if (!Schema::getConnection()->getSchemaBuilder()->hasIndex('accounts', ['organization_id', 'is_cash_account'])) {
            Schema::table('accounts', function (Blueprint $table): void {
                $table->index(['organization_id', 'is_cash_account']);
            });
        }

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

        Schema::table('accounts', function (Blueprint $table): void {
            $table->dropIndex(['accounts_organization_id_is_cash_account_index']);
            $table->dropColumn('is_cash_account');
        });

        Schema::table('vouchers', function (Blueprint $table): void {
            $table->dropForeign(['financial_transaction_id']);
        });
    }
};
