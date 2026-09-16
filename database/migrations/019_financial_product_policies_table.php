<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_product_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_product_id')
                ->unique()
                ->constrained('financial_products')
                ->cascadeOnDelete();

            // Explicit numeric rules used by deposit and loan products.
            $table->decimal('minimum_opening_amount', 20, 4)->nullable();
            $table->decimal('minimum_deposit_amount', 20, 4)->nullable();
            $table->decimal('maximum_deposit_amount', 20, 4)->nullable();
            $table->decimal('maximum_loan_amount', 20, 4)->nullable();
            $table->decimal('loan_to_value_percent', 8, 4)->nullable();
            $table->decimal('interest_rebate_percent', 8, 4)->nullable();

            // Product rules that may contain tiers or multiple allowed values.
            $table->json('deposit_amount_rules')->nullable();
            $table->json('tenure_rules')->nullable();
            $table->json('loan_ceiling_rules')->nullable();
            $table->json('repayment_rules')->nullable();
            $table->json('eligibility_rules')->nullable();
            $table->json('security_rules')->nullable();
            $table->json('documentation_requirements')->nullable();
            $table->json('maturity_examples')->nullable();

            // Policy provenance and lifecycle; do not treat public web data as final approval.
            $table->string('source_url', 500)->nullable();
            $table->date('source_checked_at')->nullable();
            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();
            $table->string('version', 50)->nullable();
            $table->enum('status', ['DRAFT', 'ACTIVE', 'RETIRED'])->default('DRAFT');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_product_policies');
    }
};
