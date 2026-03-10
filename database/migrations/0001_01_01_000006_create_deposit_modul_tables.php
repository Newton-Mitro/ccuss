<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('deposit_products', function (Blueprint $table) {
            $table->id();

            // Basic product info
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['Deposit', 'Loan', 'Share']);
            $table->string('subtype'); // e.g., Savings, Recurring, Fixed

            // Financial parameters
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->enum('interest_compounding', ['daily', 'monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->decimal('minimum_balance', 15, 2)->default(0);
            $table->decimal('maximum_balance', 15, 2)->nullable();
            $table->decimal('monthly_deposit_limit', 15, 2)->nullable();

            // Tenure rules
            $table->integer('minimum_tenure_months')->nullable();
            $table->integer('maximum_tenure_months')->nullable();

            // Policy flags
            $table->boolean('allow_partial_withdrawal')->default(false);
            $table->boolean('allow_early_closure')->default(false);
            $table->boolean('is_active')->default(true);

            // Dynamic policy/config JSON for future flexibility
            $table->json('policies')->nullable();
            /*
              Example JSON:
              {
                "min_deposit_increment": 0,                // Minimum increment for deposits
                "maximum_balance": null,                   // Maximum allowed balance
                "monthly_deposit_limit": null,             // Limit per month (for recurring deposits)

                "tenure_months": null,                     // Fixed/recurring deposit tenure
                "minimum_tenure_months": null,
                "maximum_tenure_months": null,

                "interest_credit_frequency": "monthly",    // daily, monthly, quarterly, yearly
                "premature_interest_rate": null,           // Interest if withdrawn early
                "senior_citizen_bonus_rate": 0,            // Extra interest for senior citizens
                "tax_deducted_at_source": false,           // TDS applicable

                "auto_renew": false,                        // Auto-renew on maturity
                "grace_period_days": 0,                     // Days allowed after maturity without penalty
                "allow_partial_withdrawal": false,
                "max_withdrawals_per_month": null,
                "penalty_on_early_withdrawal": 0,           // % penalty on early withdrawal
                "penalty_on_early_closure": 0,              // % penalty on closing before maturity

                "minimum_balance_for_interest": 0,          // Balance needed to earn interest
                "age_limit_min": null,                       // Min age for product
                "age_limit_max": null,                       // Max age for product

                "special_conditions": {
                    "high_interest": false,
                    "holiday_interest": false,
                    "restricted_product": false
                },

                "notes": ""                                 // Any free-form remarks or internal notes
            }
            */

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('deposit_accounts', function (Blueprint $table) {
            $table->id();

            // account identifier
            $table->string('account_no', 30)->unique();
            $table->string('account_name');

            // relationships
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deposit_product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();

            // balances
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('available_balance', 15, 2)->default(0);
            $table->decimal('hold_balance', 15, 2)->default(0);

            // account settings
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->decimal('minimum_balance', 15, 2)->default(0);

            // dates
            $table->date('opened_at');
            $table->date('closed_at')->nullable();

            // status
            $table->enum('status', ['PENDING', 'ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED'])->default('PENDING');

            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('deposit_account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained();
            $table->string('holder_type')->default('PRIMARY');
            // PRIMARY, JOINT, AUTHORIZED
            $table->decimal('ownership_percent', 5, 2)->nullable();
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('deposit_account_nominees', function (Blueprint $table) {
            $table->id();

            // The deposit account
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();

            // Nominee details
            $table->string('name');                   // Nominee name
            $table->string('relation');               // Relation to account holder (e.g., Spouse, Child)
            $table->date('date_of_birth')->nullable();
            $table->decimal('allocation_percent', 5, 2)->default(100); // % of proceeds for this nominee
            $table->text('remarks')->nullable();       // Any notes or instructions

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('share_account_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts');
            $table->integer('shares_owned')->default(0);
            $table->decimal('share_value', 10, 2)->default(0);
            $table->boolean('voting_rights')->default(true);
            $table->timestamps();
        });

        Schema::create('term_deposit_details', function (Blueprint $table) {
            $table->foreignId('deposit_account_id')->primary()->constrained('deposit_accounts');
            $table->integer('tenure_months');
            $table->decimal('maturity_amount', 15, 2);
            $table->decimal('premature_penalty_rate', 5, 2)->default(0);
            $table->enum('payout_mode', ['MATURITY', 'MONTHLY'])->default('MATURITY');
        });

        Schema::create('recurring_deposit_details', function (Blueprint $table) {
            $table->foreignId('deposit_account_id')->primary()->constrained('deposit_accounts');
            $table->decimal('installment_amount', 15, 2);
            $table->enum('installment_frequency', ['MONTHLY', 'QUARTERLY', 'ANNUAL'])->default('MONTHLY');
            $table->integer('total_installments');
            $table->integer('paid_installments')->default(0);
            $table->date('next_due_date')->nullable();
            $table->decimal('penalty_rate', 5, 2)->default(0);
            $table->integer('grace_days')->default(0);
            $table->decimal('maturity_amount', 15, 2)->default(0);
        });

        Schema::create('recurring_deposit_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts');
            $table->integer('installment_no');
            $table->date('due_date');
            $table->decimal('amount_due', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->date('paid_on')->nullable();
            $table->enum('status', ['DUE', 'PAID', 'MISSED'])->default('DUE');
            $table->decimal('penalty_amount', 15, 2)->default(0);
        });

        Schema::create('deposit_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no')->unique();
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->enum('transaction_type', [
                'DEPOSIT',
                'WITHDRAW',
                'TRANSFER',
                'INTEREST',
                'PENALTY',
                'CHEQUE_WITHDRAWAL',
                'CHEQUE_DEPOSIT',
                'REVERSAL'
            ]);
            $table->decimal('amount', 18, 2);
            $table->decimal('balance_after', 18, 2)->nullable();
            $table->dateTime('transaction_date');
            $table->string('reference_no')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('deposit_transaction_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deposit_account_id')->constrained();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('deposit_account_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deposit_transaction_id')->constrained()->cascadeOnDelete();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2);
            $table->dateTime('posted_at');
            $table->timestamps();
        });

        Schema::create('deposit_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['deposit_account_id', 'accrual_date']); // prevent duplicate accrual
        });

        Schema::create('deposit_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['LATE_PAYMENT', 'PREMATURE_WITHDRAWAL', 'OVERDUE', 'OTHER']);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(
                ['deposit_account_id', 'penalty_date', 'penalty_type'],
                'dep_penalty_unique'
            );
        });

        Schema::create('deposit_account_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();
            $table->string('fee_type'); // e.g., OPENING, MAINTENANCE, TRANSACTION
            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'])->default('ONE_TIME');
            $table->date('applied_on')->nullable(); // date when fee was applied
            $table->boolean('is_paid')->default(false); // track payment status
            $table->foreignId('paid_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });


    }


    public function down(): void
    {
        // Child / dependent tables first
        Schema::dropIfExists('deposit_account_fees');
        Schema::dropIfExists('deposit_account_nominees');
        Schema::dropIfExists('deposit_penalties');
        Schema::dropIfExists('deposit_interest_accruals');
        Schema::dropIfExists('deposit_account_statements');
        Schema::dropIfExists('deposit_transaction_lines');
        Schema::dropIfExists('deposit_transactions');
        Schema::dropIfExists('recurring_deposit_installments');
        Schema::dropIfExists('recurring_deposit_details');
        Schema::dropIfExists('term_deposit_details');
        Schema::dropIfExists('share_account_details');
        Schema::dropIfExists('deposit_account_holders');

        // Parent tables
        Schema::dropIfExists('deposit_accounts');
        Schema::dropIfExists('deposit_products');
    }
};
