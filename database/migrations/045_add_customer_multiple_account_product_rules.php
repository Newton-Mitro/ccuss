<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financial_products', function (Blueprint $table): void {
            $table->boolean('customer_can_open_multiple_account')->default(true);
        });

        Schema::table('financial_product_policies', function (Blueprint $table): void {
            $table->boolean('customer_can_open_multiple_account')->nullable();
        });

        Schema::table('financial_accounts', function (Blueprint $table): void {
            $table->foreignId('financial_product_term_id')
                ->nullable()
                ->after('financial_product_id')
                ->constrained('financial_product_terms')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('financial_accounts', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('financial_product_term_id');
        });

        Schema::table('financial_product_policies', function (Blueprint $table): void {
            $table->dropColumn('customer_can_open_multiple_account');
        });

        Schema::table('financial_products', function (Blueprint $table): void {
            $table->dropColumn('customer_can_open_multiple_account');
        });
    }
};
