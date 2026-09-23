<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('category', ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'OTHER']);
            $table->enum('balance_type', ['ASSET', 'LIABILITY', 'EQUITY']);
            $table->decimal('interest_rate', 12, 6)->default(0);
            $table->enum('interest_calculation', ['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])->default('NONE');
            $table->enum('interest_frequency', ['NONE', 'DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])->default('NONE');
            $table->json('settings')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'category']);
        });

        Schema::create('financial_product_account_mappings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_product_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_type', 50);
            $table->foreignId('debit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('credit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['financial_product_id', 'transaction_type'], 'fp_account_map_product_type_unique');
        });

        Schema::create('financial_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('financial_product_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('holder');
            $table->string('account_no', 100);
            $table->string('name', 200)->nullable();
            $table->enum('account_type', ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CASH', 'BANK', 'OTHER']);
            $table->enum('status', ['PENDING', 'ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED', 'WRITTEN_OFF'])->default('PENDING');
            $table->decimal('balance', 20, 4)->default(0);
            $table->decimal('available_balance', 20, 4)->default(0);
            $table->decimal('interest_accrued', 20, 4)->default(0);
            $table->date('opened_at')->nullable();
            $table->date('closed_at')->nullable();
            $table->date('last_operated_at')->nullable();
            $table->date('membership_eligible_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'account_no']);
            $table->index(['organization_id', 'branch_id']);
            $table->index(['organization_id', 'financial_product_id']);
            $table->index(['account_type', 'status']);
        });

        Schema::create('financial_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('transaction_no', 100);
            $table->string('transaction_type', 50);
            $table->dateTime('transaction_date');
            $table->decimal('amount', 20, 4);
            $table->string('currency', 10)->default('BDT');
            $table->enum('status', ['PENDING', 'POSTED', 'REVERSED', 'CANCELLED'])->default('PENDING');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->nullableMorphs('source');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'transaction_no']);
        });

        Schema::create('financial_transaction_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->enum('direction', ['DEBIT', 'CREDIT']);
            $table->decimal('amount', 20, 4);
            $table->decimal('balance_after', 20, 4)->nullable();
            $table->string('description')->nullable();
            $table->unsignedInteger('line_no')->default(1);
            $table->timestamps();
            $table->index(['financial_account_id', 'id']);
            $table->index(['financial_transaction_id', 'line_no'], 'fin_tx_entry_line_index');
        });

        Schema::create('financial_product_policies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_product_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('minimum_opening_amount', 20, 4)->nullable();
            $table->decimal('minimum_deposit_amount', 20, 4)->nullable();
            $table->decimal('maximum_deposit_amount', 20, 4)->nullable();
            $table->decimal('maximum_loan_amount', 20, 4)->nullable();
            $table->decimal('loan_to_value_percent', 8, 4)->nullable();
            $table->decimal('interest_rebate_percent', 8, 4)->nullable();
            $table->json('deposit_amount_rules')->nullable();
            $table->json('tenure_rules')->nullable();
            $table->json('loan_ceiling_rules')->nullable();
            $table->json('repayment_rules')->nullable();
            $table->json('eligibility_rules')->nullable();
            $table->json('security_rules')->nullable();
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
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_product_policies');
        Schema::dropIfExists('financial_transaction_entries');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('financial_accounts');
        Schema::dropIfExists('financial_product_account_mappings');
        Schema::dropIfExists('financial_products');
    }
};
