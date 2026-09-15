<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('financial_products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('category', [
                'SAVINGS',
                'SHARE',
                'FIXED_DEPOSIT',
                'RECURRING_DEPOSIT',
                'LOAN',
                'OTHER',
            ]);
            /*
             * Determines whether the product normally represents
             * an asset, liability, or equity position.
             */
            $table->enum('balance_type', ['ASSET', 'LIABILITY', 'EQUITY']);
            $table->decimal('interest_rate', 12, 6)->default(0);
            $table->enum('interest_calculation', ['NONE', 'SIMPLE', 'COMPOUND', 'FLAT', 'REDUCING_BALANCE'])->default('NONE');
            $table->enum('interest_frequency', [
                'NONE',
                'DAILY',
                'MONTHLY',
                'QUARTERLY',
                'HALF_YEARLY',
                'YEARLY',
                'MATURITY',
            ])->default('NONE');
            /*
             * Product-specific configuration.
             * Example:
             * {
             *   "minimum_balance": 500,
             *   "minimum_installment": 1000,
             *   "term_months": 60,
             *   "loan_to_value": 80
             * }
             */
            $table->json('settings')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'category']);
        });

        Schema::create('financial_product_account_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_product_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_type', 50);
            $table->foreignId('debit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('credit_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['financial_product_id', 'transaction_type'], 'fp_account_map_product_type_unique');
            $table->index('transaction_type');
        });

        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('financial_product_id')->nullable()->constrained()->nullOnDelete();
            /*
             * Member / organization / other holder.
             *
             * Example:
             * Member -> member_id
             * Corporate customer -> customer_id
             */
            $table->nullableMorphs('holder');
            $table->string('account_no', 100);
            $table->string('name', 200)->nullable();
            $table->enum('account_type', [
                'SAVINGS',
                'SHARE',
                'FIXED_DEPOSIT',
                'RECURRING_DEPOSIT',
                'LOAN',
                'CASH',
                'BANK',
                'OTHER',
            ]);
            $table->enum('status', ['PENDING', 'ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED', 'WRITTEN_OFF'])->default('PENDING');

            /*
             * Cached balance.
             *
             * Financial transactions remain the source of truth.
             * This value is maintained transactionally for performance.
             */
            $table->decimal('balance', 20, 4)->default(0);
            $table->decimal('available_balance', 20, 4)->default(0);
            $table->decimal('interest_accrued', 20, 4)->default(0);
            $table->date('opened_at')->nullable();
            $table->date('closed_at')->nullable();

            /*
             * Account-specific data.
             *
             * Example for FDR:
             * {
             *   "principal": 100000,
             *   "term_months": 12,
             *   "maturity_date": "2027-01-01"
             * }
             *
             * Example for Loan:
             * {
             *   "principal": 500000,
             *   "term_months": 60,
             *   "installment_amount": 12000
             * }
             */
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'account_no']);
            $table->index(['organization_id', 'branch_id']);
            $table->index(['organization_id', 'financial_product_id']);
            $table->index(['account_type', 'status']);
        });

        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('financial_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('transaction_no', 100);
            $table->string('transaction_type', 50);
            $table->dateTime('transaction_date');
            $table->decimal('amount', 20, 4);
            $table->string('currency', 10)->default('BDT');
            $table->enum('status', ['PENDING', 'POSTED', 'REVERSED', 'CANCELLED'])->default('PENDING');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();

            /*
             * Connect transaction to another ERP module.
             *
             * Example:
             * Loan repayment
             * Teller transaction
             * Deposit transaction
             */
            $table->nullableMorphs('source');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'transaction_no']);
            $table->index(['financial_account_id', 'transaction_date'], 'fin_tx_account_date_index');
            $table->index(['organization_id', 'transaction_type', 'transaction_date'], 'fin_tx_org_type_date_index');
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->foreign('financial_transaction_id')->references('id')->on('financial_transactions')->nullOnDelete();
        });

        Schema::create('financial_transaction_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->enum('direction', ['DEBIT', 'CREDIT']);
            $table->decimal('amount', 20, 4);

            /*
             * Balance after this transaction.
             *
             * Extremely useful for member statements.
             */
            $table->decimal('balance_after', 20, 4)->nullable();
            $table->string('description')->nullable();
            $table->unsignedInteger('line_no')->default(1);
            $table->timestamps();
            $table->index(['financial_account_id', 'id']);
            $table->index(['financial_transaction_id', 'line_no'], 'fin_tx_entry_line_index');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transaction_entries');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('financial_accounts');
        Schema::dropIfExists('financial_product_account_mappings');
        Schema::dropIfExists('financial_products');
    }
};