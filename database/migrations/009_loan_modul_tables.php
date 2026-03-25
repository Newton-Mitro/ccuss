<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('loan_products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['personal', 'sme', 'education', 'housing']);
            // Financial parameters
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->enum('interest_type', ['fixed', 'floating'])->default('fixed');
            $table->enum('interest_compounding', ['daily', 'monthly', 'quarterly', 'yearly'])->default('monthly');

            $table->decimal('min_loan_amount', 15, 2)->default(0);
            $table->decimal('max_loan_amount', 15, 2)->nullable();
            $table->integer('min_tenure_months')->nullable();
            $table->integer('max_tenure_months')->nullable();
            $table->enum('repayment_frequency', ['weekly', 'monthly', 'quarterly'])->default('monthly');
            $table->enum('repayment_type', ['principal_and_interest', 'principal_only', 'interest_only', 'balloon', 'equal_installments'])->default('principal_and_interest');

            // Policy / JSON for flexible rules
            $table->json('policies')->nullable();
            /*
            Example:
            {
                "min_loan_amount": 0,                      // Minimum loan principal
                "max_loan_amount": null,                    // Maximum loan principal
                "loan_tenure_months": null,                 // Default/maximum tenure
                "min_tenure_months": null,
                "max_tenure_months": null,

                "interest_type": "fixed",                   // fixed, floating
                "interest_rate": 0,                          // Annual interest rate in %
                "interest_compounding": "monthly",          // daily, monthly, quarterly, yearly
                "grace_period_days": 0,                      // Grace period for repayment after disbursement

                "repayment_frequency": "monthly",           // weekly, monthly, quarterly
                "repayment_type": "principal_and_interest", // principal_only, interest_only, balloon, equal_installments

                "penalty_on_late_payment": 0,               // % of installment or fixed amount
                "prepayment_allowed": false,                // Can borrower repay early?
                "prepayment_penalty": 0,                    // % of principal if prepayment occurs

                "collateral_required": false,               // Secured or unsecured loan
                "collateral_type": null,                    // Property, vehicle, guarantee, etc.
                "insurance_required": false,                // Optional insurance coverage

                "age_limit_min": null,
                "age_limit_max": null,
                "income_requirement": null,                 // Minimum income for eligibility
                "credit_score_min": null,                   // Minimum credit score if applicable

                "auto_disburse_on_approval": false,         // Automatic disbursement after approval
                "loan_processing_fee": 0,                   // Fixed or percentage fee
                "service_charges": 0,                       // Additional charges

                "special_conditions": {
                    "high_risk": false,
                    "subsidized_rate": false,
                    "promotional_scheme": false
                },

                "notes": ""                                 // Free-form internal notes
            }
            */
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no', 50)->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->decimal('applied_amount', 15, 2);
            $table->integer('applied_tenure');
            $table->text('purpose')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        Schema::create('loan_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_application_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('file_path');
            $table->timestamps();
        });

        Schema::create('loan_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('approved_amount', 15, 2);
            $table->integer('approved_tenure')->nullable();
            $table->text('approval_notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
            $table->unique(['loan_application_id'], 'loan_approval_unique');
        });

        Schema::create('loan_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 30)->unique();
            $table->string('account_name');
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->integer('tenure_months');
            $table->enum('repayment_frequency', ['daily', 'weekly', 'monthly'])->default('monthly');
            $table->decimal('installment_amount', 15, 2)->nullable();
            $table->date('disbursement_date')->nullable();
            $table->date('first_installment_date')->nullable();
            $table->date('maturity_date')->nullable();
            $table->decimal('principal_outstanding', 15, 2)->default(0);
            $table->decimal('interest_outstanding', 15, 2)->default(0);
            $table->decimal('penalty_outstanding', 15, 2)->default(0);
            $table->enum('status', ['pending', 'approved', 'active', 'closed', 'defaulted', 'written_off'])->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_collaterals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['land', 'gold', 'vehicle', 'other']);
            $table->text('description')->nullable();
            $table->decimal('estimated_value', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('loan_guarantors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->decimal('guarantee_amount', 15, 2);
            $table->string('relationship')->nullable();
            $table->timestamps();
            $table->unique(['loan_account_id', 'customer_id']);
        });

        Schema::create('loan_borrowers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['primary', 'co_borrower'])->default('primary');
            $table->decimal('liability_percentage', 5, 2)->default(100);
            $table->timestamps();
            $table->unique(['loan_account_id', 'customer_id']);
        });

        Schema::create('loan_repayment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->integer('installment_no');
            $table->date('due_date');
            $table->decimal('principal', 15, 2);
            $table->decimal('interest', 15, 2);
            $table->decimal('penalty', 15, 2)->default(0);
            $table->decimal('total_due', 15, 2);
            $table->enum('status', ['pending', 'paid', 'late'])->default('pending');
            $table->timestamps();
        });

        Schema::create('loan_reschedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->integer('old_tenure');
            $table->integer('new_tenure');
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->integer('installment_no');
            $table->decimal('principal_paid', 15, 2);
            $table->decimal('interest_paid', 15, 2);
            $table->decimal('penalty_paid', 15, 2)->default(0);
            $table->date('payment_date');
            $table->timestamps();
        });

        Schema::create('loan_disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            // $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete();
            $table->decimal('disbursement_amount', 18, 2);
            $table->date('disbursement_date');
            $table->string('reference_no')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['loan_account_id', 'disbursement_date'], 'loan_disbursement_unique');
        });

        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            // $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['loan_account_id', 'accrual_date'], 'loan_interest_unique');
        });

        Schema::create('loan_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['late_payment', 'premature_withdrawal', 'overdue', 'other']);
            $table->boolean('is_posted')->default(false);
            // $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['loan_account_id', 'penalty_date', 'penalty_type'], 'loan_penalty_unique');
        });

        Schema::create('loan_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('amount', 15, 2)->default(0);
            $table->enum('charge_type', ['processing', 'insurance', 'documentation', 'other'])->default('other');
            $table->timestamps();
        });

        Schema::create('loan_writeoffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->decimal('writeoff_amount', 15, 2);
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_notification_templates', function (Blueprint $table) {
            $table->id();

            $table->string('name'); // e.g., 'Repayment Reminder', 'Overdue Alert'
            $table->string('type'); // e.g., 'REPAYMENT_REMINDER', 'OVERDUE_ALERT'
            $table->text('message'); // Template message with placeholders e.g., "Your installment of {{amount}} is due on {{due_date}}"

            // Recurrence configuration
            $table->enum('recurrence', ['once', 'daily', 'weekly', 'monthly'])->default('once');
            $table->integer('days_before_due')->nullable(); // e.g., 3 days before due date
            $table->time('send_time')->nullable(); // Time of day to send

            // Optional channels
            $table->boolean('via_email')->default(true);
            $table->boolean('via_sms')->default(false);

            $table->boolean('is_active')->default(true);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('loan_notification_templates')->cascadeOnDelete();

            $table->text('message'); // Final message after placeholder replacement
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->dateTime('scheduled_at'); // When this notification should go out
            $table->dateTime('sent_at')->nullable(); // Actual send time

            $table->boolean('via_email')->default(true);
            $table->boolean('via_sms')->default(false);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_notifications');
        Schema::dropIfExists('loan_notification_templates');
        Schema::dropIfExists('loan_writeoffs');
        Schema::dropIfExists('loan_charges');
        Schema::dropIfExists('loan_penalties');
        Schema::dropIfExists('loan_interest_accruals');
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('loan_reschedules');
        Schema::dropIfExists('loan_repayment_schedules');
        Schema::dropIfExists('loan_borrowers');
        Schema::dropIfExists('loan_guarantors');
        Schema::dropIfExists('loan_collaterals');
        Schema::dropIfExists('loan_disbursements');
        Schema::dropIfExists('loan_accounts');
        Schema::dropIfExists('loan_approvals');
        Schema::dropIfExists('loan_documents');
        Schema::dropIfExists('loan_applications');
        Schema::dropIfExists('loan_products');
    }
};