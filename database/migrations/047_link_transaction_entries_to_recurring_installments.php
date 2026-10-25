<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('financial_transaction_entries', 'recurring_deposit_installment_id')) {
            Schema::table('financial_transaction_entries', function (Blueprint $table): void {
                $table->unsignedBigInteger('recurring_deposit_installment_id')
                    ->nullable()
                    ->after('financial_account_id');
            });
        }

        Schema::table('financial_transaction_entries', function (Blueprint $table): void {
            $table->foreign('recurring_deposit_installment_id', 'fin_tx_entry_rd_installment_fk')
                ->references('id')
                ->on('recurring_deposit_installments')
                ->nullOnDelete();
            $table->index('recurring_deposit_installment_id', 'fin_tx_entry_rd_installment_index');
        });
    }

    public function down(): void
    {
        Schema::table('financial_transaction_entries', function (Blueprint $table): void {
            $table->dropForeign('fin_tx_entry_rd_installment_fk');
            $table->dropIndex('fin_tx_entry_rd_installment_index');
            $table->dropColumn('recurring_deposit_installment_id');
        });
    }
};
