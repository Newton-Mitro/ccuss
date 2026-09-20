<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('financial_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
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
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('financial_product_id')->nullable()->constrained()->nullOnDelete();
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
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
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

        Schema::table('customer_introducers', function (Blueprint $table): void {
            $table->foreign('introducer_account_id', 'customer_introducers_account_id_foreign')
                ->references('id')
                ->on('financial_accounts')
                ->nullOnDelete();
        });

        Schema::create('financial_transaction_entries', function (Blueprint $table) {
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

        Schema::table('accounts', function (Blueprint $table): void {
            $table->boolean('is_cash_account')->default(false)->after('is_reconcilable');
            $table->index(['organization_id', 'is_cash_account']);
        });

        Schema::create('branch_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('business_date');
            $table->enum('status', ['OPEN', 'CLOSING', 'CLOSED'])->default('OPEN');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('opening_note')->nullable();
            $table->text('closing_note')->nullable();
            $table->timestamps();
            $table->unique(['branch_id', 'business_date']);
            $table->index(['organization_id', 'status']);
        });

        Schema::create('cash_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_account_id')->nullable()->constrained('financial_accounts')->nullOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('type', ['VAULT', 'TELLER', 'PETTY_CASH', 'OTHER']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['branch_id', 'type']);
        });

        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_location_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->decimal('maximum_balance', 20, 4)->nullable();
            $table->timestamps();
            $table->unique('code');
        });

        Schema::create('tellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_location_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->decimal('maximum_cash', 20, 4)->nullable();
            $table->timestamps();
            $table->unique('code');
        });

        Schema::create('teller_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teller_id')->constrained()->restrictOnDelete();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['OPEN', 'CLOSING', 'CLOSED'])->default('OPEN');
            $table->decimal('opening_cash', 20, 4)->default(0);
            $table->decimal('closing_cash', 20, 4)->nullable();
            $table->decimal('expected_cash', 20, 4)->nullable();
            $table->decimal('cash_difference', 20, 4)->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('closing_note')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'teller_id']);
        });

        Schema::create('cash_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('currency', 10)->default('BDT');
            $table->enum('type', ['NOTE', 'COIN'])->default('NOTE');
            $table->decimal('value', 20, 4);
            $table->string('name', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['organization_id', 'currency', 'value', 'type']);
        });

        Schema::create('cash_counts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['OPENING', 'CLOSING', 'TRANSFER_OUT', 'TRANSFER_IN', 'VERIFICATION', 'ADJUSTMENT']);
            $table->decimal('total_amount', 20, 4)->default(0);
            $table->foreignId('counted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('counted_at');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['cash_location_id', 'counted_at']);
        });

        Schema::create('cash_count_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_count_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_denomination_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->decimal('amount', 20, 4)->default(0);
            $table->timestamps();
            $table->unique(['cash_count_id', 'cash_denomination_id'], 'cash_count_denomination_unique');
        });

        Schema::create('cash_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_cash_location_id')->constrained('cash_locations')->restrictOnDelete();
            $table->foreignId('to_cash_location_id')->constrained('cash_locations')->restrictOnDelete();
            $table->decimal('amount', 20, 4);
            $table->string('transfer_no', 100);
            $table->enum('status', ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'transfer_no']);
            $table->index(['from_cash_location_id', 'to_cash_location_id']);
        });

        Schema::create('petty_cash_funds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_location_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('custodian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->decimal('fund_limit', 20, 4);
            $table->decimal('current_balance', 20, 4)->default(0);
            $table->enum('method', ['IMPREST', 'VARIABLE'])->default('IMPREST');
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->timestamps();
            $table->unique('code');
        });

        Schema::create('petty_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('petty_cash_fund_id')->constrained()->restrictOnDelete();
            $table->string('transaction_no', 100);
            $table->enum('type', ['FUNDING', 'EXPENSE', 'REPLENISHMENT', 'RETURN', 'ADJUSTMENT']);
            $table->decimal('amount', 20, 4);
            $table->string('payee')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('expense_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['branch_day_id', 'transaction_no']);
        });

        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('short_name', 50)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
        });

        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('bank_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('account_name', 200);
            $table->string('account_number', 100);
            $table->string('routing_number', 100)->nullable();
            $table->enum('account_type', ['CURRENT', 'SAVINGS', 'FDR', 'OTHER'])->default('CURRENT');
            $table->decimal('opening_balance', 20, 4)->default(0);
            $table->boolean('is_reconcilable')->default(true);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->timestamps();
            $table->unique(['organization_id', 'account_number']);
            $table->index(['branch_id', 'bank_id']);
        });

        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained()->restrictOnDelete();
            $table->string('transaction_no', 100);
            $table->enum('type', [
                'DEPOSIT',
                'WITHDRAWAL',
                'TRANSFER_IN',
                'TRANSFER_OUT',
                'CHARGE',
                'INTEREST',
                'ADJUSTMENT',
            ]);

            $table->decimal('amount', 20, 4);
            $table->date('transaction_date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->decimal('balance_after', 20, 4)->nullable();
            $table->enum('status', ['PENDING', 'POSTED', 'RECONCILED', 'CANCELLED'])->default('PENDING');
            $table->timestamps();
            $table->unique(['bank_account_id', 'transaction_no']);
            $table->index(['bank_account_id', 'transaction_date']);
        });

        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->date('statement_date');
            $table->decimal('statement_balance', 20, 4);
            $table->decimal('book_balance', 20, 4);
            $table->decimal('difference', 20, 4);
            $table->enum('status', ['OPEN', 'RECONCILED'])->default('OPEN');
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reconciled_at')->nullable();
            $table->timestamps();
            $table->unique(['bank_account_id', 'statement_date']);
        });

        Schema::create('cheque_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->string('book_no', 100);
            $table->string('prefix', 50)->nullable();
            $table->unsignedBigInteger('start_number');
            $table->unsignedBigInteger('end_number');
            $table->unsignedBigInteger('current_number')->nullable();
            $table->unsignedInteger('leaf_count');
            $table->date('issued_date')->nullable();
            $table->enum('status', ['AVAILABLE', 'IN_USE', 'EXHAUSTED', 'CANCELLED'])->default('AVAILABLE');
            $table->timestamps();
            $table->unique(['bank_account_id', 'book_no']);
            $table->index(['bank_account_id', 'status']);
        });

        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_book_id')->constrained()->cascadeOnDelete();
            $table->string('cheque_no', 100);
            $table->enum('status', [
                'UNUSED',
                'ISSUED',
                'PRESENTED',
                'CLEARED',
                'BOUNCED',
                'STOPPED',
                'CANCELLED',
                'EXPIRED',
            ])->default('UNUSED');

            $table->date('issue_date')->nullable();
            $table->date('cheque_date')->nullable();
            $table->decimal('amount', 20, 4)->nullable();
            $table->string('payee')->nullable();
            $table->string('memo')->nullable();
            $table->date('presented_date')->nullable();
            $table->date('cleared_date')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['cheque_book_id', 'cheque_no']);
            $table->index(['cheque_no', 'status']);
        });

        Schema::create('cheque_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_day_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', [
                'ISSUE',
                'DEPOSIT',
                'PRESENT',
                'CLEAR',
                'BOUNCE',
                'STOP',
                'CANCEL',
                'RETURN',
            ]);
            $table->decimal('amount', 20, 4)->nullable();
            $table->dateTime('transaction_date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['cheque_id', 'transaction_date']);
        });

        Schema::create('cheque_clearings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_id')->constrained()->restrictOnDelete();
            $table->foreignId('branch_day_id')->constrained()->restrictOnDelete();
            $table->string('clearing_no', 100);
            $table->string('drawer_bank_name', 150)->nullable();
            $table->string('drawer_bank_branch', 150)->nullable();
            $table->string('drawer_account_no', 100)->nullable();
            $table->decimal('amount', 20, 4);
            $table->date('clearing_date');
            $table->enum('status', ['RECEIVED', 'SENT', 'PRESENTED', 'CLEARED', 'RETURNED', 'CANCELLED'])->default('RECEIVED');
            $table->string('return_reason')->nullable();
            $table->date('cleared_date')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'clearing_no']);
        });

        Schema::create('branch_cash_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('opening_cash', 20, 4)->default(0);
            $table->decimal('cash_received', 20, 4)->default(0);
            $table->decimal('cash_paid', 20, 4)->default(0);
            $table->decimal('vault_balance', 20, 4)->default(0);
            $table->decimal('teller_balance', 20, 4)->default(0);
            $table->decimal('petty_cash_balance', 20, 4)->default(0);
            $table->decimal('closing_cash', 20, 4)->default(0);
            $table->decimal('cash_difference', 20, 4)->default(0);
            $table->timestamps();
        });

        Schema::create('cash_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 20, 4);
            $table->enum('type', ['SHORTAGE', 'EXCESS']);
            $table->text('reason');
            $table->enum('status', ['PENDING', 'APPROVED', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->index(['branch_day_id', 'status']);
            $table->index(['cash_location_id', 'created_at']);
        });

        Schema::create('teller_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->constrained()->restrictOnDelete();
            $table->string('transaction_no', 100);
            $table->enum('type', ['DEPOSIT', 'WITHDRAWAL']);
            $table->decimal('amount', 20, 4);
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->string('reference')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'transaction_no']);
            $table->index(['teller_session_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teller_cash_transactions');


        Schema::dropIfExists('cash_adjustments');


        Schema::dropIfExists('branch_cash_summaries');
        Schema::dropIfExists('cheque_clearings');
        Schema::dropIfExists('cheque_transactions');
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('cheque_books');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('banks');
        Schema::dropIfExists('petty_cash_transactions');
        Schema::dropIfExists('petty_cash_funds');
        Schema::dropIfExists('cash_transfers');
        Schema::dropIfExists('cash_count_denominations');
        Schema::dropIfExists('cash_counts');
        Schema::dropIfExists('cash_denominations');
        Schema::dropIfExists('teller_sessions');
        Schema::dropIfExists('tellers');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('cash_locations');
        Schema::dropIfExists('branch_days');


        Schema::table('accounts', function (Blueprint $table): void {
            $table->dropIndex(['accounts_organization_id_is_cash_account_index']);
            $table->dropColumn('is_cash_account');
        });


        Schema::dropIfExists('financial_product_policies');


        Schema::table('customer_introducers', function (Blueprint $table): void {
            $table->dropForeign('customer_introducers_account_id_foreign');
        });

        Schema::dropIfExists('financial_transaction_entries');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('financial_accounts');
        Schema::dropIfExists('financial_product_account_mappings');
        Schema::dropIfExists('financial_products');
    }
};
