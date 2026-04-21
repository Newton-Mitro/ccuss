<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('deposit_products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['saving', 'share', 'recurring', 'term'])->default('saving');
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->enum('interest_compounding', ['daily', 'monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->decimal('minimum_balance', 15, 2)->default(0);
            $table->decimal('maximum_balance', 15, 2)->nullable();
            $table->decimal('monthly_deposit_limit', 15, 2)->nullable();
            $table->integer('minimum_tenure_months')->nullable();
            $table->integer('maximum_tenure_months')->nullable();
            $table->boolean('allow_partial_withdrawal')->default(false);
            $table->boolean('allow_early_closure')->default(false);
            $table->boolean('is_active')->default(true);
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
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('saving_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 30)->unique();
            $table->string('account_name');
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->date('opened_at');
            $table->date('closed_at')->nullable();
            $table->decimal('hold_balance', 18, 2)->default(0);
            $table->decimal('minimum_balance', 18, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subledger_id')->constrained('subledgers')->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::create('share_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 30)->unique();
            $table->string('account_name');
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->date('opened_at');
            $table->date('closed_at')->nullable();
            $table->integer('shares_owned')->default(0);
            $table->decimal('share_value', 10, 2)->default(0);
            $table->boolean('voting_rights')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subledger_id')->constrained('subledgers')->cascadeOnDelete();
        });

        Schema::create('term_deposit_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 30)->unique();
            $table->string('account_name');
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->date('opened_at');
            $table->date('closed_at')->nullable();
            $table->integer('tenure_months');
            $table->decimal('maturity_amount', 15, 2);
            $table->decimal('premature_penalty_rate', 5, 2)->default(0);
            $table->enum('payout_mode', ['maturity', 'monthly'])->default('maturity');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subledger_id')->constrained('subledgers')->cascadeOnDelete();
        });

        Schema::create('recurring_deposit_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 30)->unique();
            $table->string('account_name');
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->date('opened_at');
            $table->date('closed_at')->nullable();
            $table->decimal('installment_amount', 15, 2);
            $table->enum('installment_frequency', ['monthly', 'quarterly', 'annual'])->default('monthly');
            $table->integer('total_installments');
            $table->integer('paid_installments')->default(0);
            $table->date('next_due_date')->nullable();
            $table->decimal('penalty_rate', 5, 2)->default(0);
            $table->integer('grace_days')->default(0);
            $table->decimal('maturity_amount', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subledger_id')->constrained('subledgers')->cascadeOnDelete();
        });

        Schema::create('recurring_deposit_installments', function (Blueprint $table) {
            $table->id();
            // ✅ CREATE COLUMN FIRST
            $table->unsignedBigInteger('recurring_deposit_account_id');

            // ✅ SHORT FK NAME (avoids MySQL limit)
            $table->integer('installment_no');
            $table->date('due_date');
            $table->decimal('amount_due', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->date('paid_on')->nullable();
            $table->enum('status', ['due', 'paid', 'missed'])->default('due');
            // $table->decimal('penalty_amount', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('recurring_deposit_account_id', 'rd_inst_account_fk')->references('id')->on('recurring_deposit_accounts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_products');
        Schema::dropIfExists('saving_accounts');
        Schema::dropIfExists('share_accounts');
        Schema::dropIfExists('term_deposit_accounts');
        Schema::dropIfExists('recurring_deposit_accounts');
        Schema::dropIfExists('recurring_deposit_installments');
    }
};
