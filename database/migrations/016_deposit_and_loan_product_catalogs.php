<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('deposit_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('category', ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT']);
            $table->enum('balance_type', ['ASSET', 'LIABILITY', 'EQUITY']);
            $table->enum('interest_calculation', ['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])->default('NONE');
            $table->enum('interest_frequency', ['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])->default('NONE');
            $table->boolean('customer_can_open_multiple_account')->default(true);
            $table->json('settings')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'category']);
        });

        Schema::create('deposit_product_terms', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('deposit_product_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->unsignedInteger('tenure_value');
            $table->enum('tenure_unit', ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR']);
            $table->decimal('interest_rate', 12, 6)->default(0);
            $table->enum('interest_calculation', ['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])->default('NONE');
            $table->enum('interest_frequency', ['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])->default('NONE');
            $table->decimal('minimum_amount', 20, 4)->nullable();
            $table->decimal('maximum_amount', 20, 4)->nullable();
            $table->json('rules')->nullable();
            $table->boolean('status')->default(true);
            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();
            $table->timestamps();
            $table->unique(['deposit_product_id', 'code'], 'deposit_terms_product_code_unique');
            $table->index(['deposit_product_id', 'status']);
        });

        Schema::create('deposit_policies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('deposit_product_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('minimum_opening_amount', 20, 4)->nullable();
            $table->decimal('minimum_deposit_amount', 20, 4)->nullable();
            $table->decimal('maximum_deposit_amount', 20, 4)->nullable();
            $table->decimal('interest_rebate_percent', 8, 4)->nullable();
            $table->boolean('customer_can_open_multiple_account')->nullable();
            $table->json('deposit_amount_rules')->nullable();
            $table->json('tenure_rules')->nullable();
            $table->json('eligibility_rules')->nullable();
            $table->json('documentation_requirements')->nullable();
            $table->json('maturity_examples')->nullable();
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

        Schema::create('deposit_product_account_mappings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('deposit_product_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_type', 50);
            $table->foreignId('debit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('credit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['deposit_product_id', 'transaction_type'], 'deposit_product_mapping_type_unique');
            $table->index(['deposit_product_id', 'status']);
        });

        Schema::create('loan_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('balance_type', ['ASSET', 'LIABILITY', 'EQUITY'])->default('ASSET');
            $table->decimal('interest_rate', 12, 6)->default(0);
            $table->enum('interest_calculation', ['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])->default('SIMPLE');
            $table->enum('interest_frequency', ['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])->default('MONTHLY');
            $table->boolean('customer_can_open_multiple_account')->default(true);
            $table->json('settings')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'status']);
        });

        Schema::create('loan_policies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_product_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('maximum_loan_amount', 20, 4)->nullable();
            $table->decimal('loan_to_value_percent', 8, 4)->nullable();
            $table->decimal('interest_rebate_percent', 8, 4)->nullable();
            $table->boolean('customer_can_open_multiple_account')->nullable();
            $table->json('loan_ceiling_rules')->nullable();
            $table->json('repayment_rules')->nullable();
            $table->json('eligibility_rules')->nullable();
            $table->json('security_rules')->nullable();
            $table->json('documentation_requirements')->nullable();
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

        Schema::create('loan_product_account_mappings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_type', 50);
            $table->foreignId('debit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('credit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['loan_product_id', 'transaction_type'], 'loan_product_mapping_type_unique');
            $table->index(['loan_product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_product_account_mappings');
        Schema::dropIfExists('loan_policies');
        Schema::dropIfExists('loan_products');
        Schema::dropIfExists('deposit_product_account_mappings');
        Schema::dropIfExists('deposit_policies');
        Schema::dropIfExists('deposit_product_terms');
        Schema::dropIfExists('deposit_products');
    }
};
