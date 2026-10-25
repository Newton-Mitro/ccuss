<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loan_protection_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 60);
            $table->string('name', 180);
            $table->text('description')->nullable();
            $table->decimal('monthly_rate_percent', 8, 2);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
        });

        Schema::create('loan_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('loan_product_id')->constrained('loan_products')->restrictOnDelete();
            $table->foreignId('loan_protection_product_id')->nullable();
            $table->foreign('loan_protection_product_id', 'la_application_protection_fk')
                ->references('id')->on('loan_protection_products')->nullOnDelete();

            $table->string('application_no', 100);
            $table->decimal('requested_amount', 20, 2);
            $table->unsignedInteger('requested_term_months')->nullable();
            $table->text('purpose')->nullable();
            $table->decimal('approved_amount', 20, 2)->nullable();
            $table->unsignedInteger('approved_term_months')->nullable();
            $table->decimal('approved_rate', 12, 2)->nullable();
            $table->enum('status', [
                'DRAFT',
                'SUBMITTED',
                'UNDER_REVIEW',
                'APPROVED',
                'REJECTED',
                'CANCELLED',
            ])->default('DRAFT');

            $table->date('applied_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('decision_note')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'application_no']);
            $table->index(['organization_id', 'branch_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['loan_product_id', 'status']);
        });


        Schema::create('loan_application_income_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_income_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('source', 120);
            $table->decimal('monthly_amount', 20, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_expense_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_expense_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('category', 120);
            $table->decimal('monthly_amount', 20, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_job_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_jobs_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('employer_name', 180);
            $table->string('job_title', 120)->nullable();
            $table->string('employment_type', 60)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('monthly_income', 20, 2)->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_asset_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_assets_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('asset_type', 100);
            $table->string('description', 255);
            $table->decimal('estimated_value', 20, 2)->nullable();
            $table->string('ownership_status', 80)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_educations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_educations_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('institution_name', 180);
            $table->string('qualification', 120)->nullable();
            $table->string('field_of_study', 120)->nullable();
            $table->unsignedSmallInteger('start_year')->nullable();
            $table->unsignedSmallInteger('end_year')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_application_supporting_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id');
            $table->foreign('loan_application_id', 'la_documents_app_fk')
                ->references('id')->on('loan_applications')->cascadeOnDelete();
            $table->string('document_type', 100);
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->timestamps();
        });

        Schema::create('loan_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('loan_application_id')->nullable()->unique()->constrained('loan_applications')->nullOnDelete();
            $table->string('loan_no', 100);
            $table->decimal('principal_amount', 20, 2);
            $table->decimal('disbursed_amount', 20, 2)->default(0);
            $table->decimal('contractual_rate', 12, 2);
            $table->enum('interest_calculation', ['SIMPLE', 'FLAT', 'REDUCING_BALANCE']);
            $table->enum('interest_frequency', ['DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'])->default('MONTHLY');
            $table->unsignedInteger('term_value');
            $table->enum('term_unit', ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'])->default('MONTH');
            $table->decimal('scheduled_principal_amount', 20, 2)->nullable();
            $table->enum('repayment_frequency', ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'])->default('MONTHLY');
            $table->unsignedInteger('grace_days')->default(0);
            $table->decimal('late_payment_fine_rate', 12, 2)->default(0);
            $table->date('approved_at')->nullable();
            $table->date('disbursed_at')->nullable();
            $table->date('first_repayment_date')->nullable();
            $table->date('maturity_date')->nullable();
            $table->enum('status', ['APPROVED', 'PARTIALLY_DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED', 'WRITTEN_OFF'])->default('APPROVED');
            $table->date('closed_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->timestamps();
            $table->unique('loan_no');
            $table->index(['status']);
            $table->index(['maturity_date', 'status']);
            $table->index(['first_repayment_date', 'status']);
        });

        Schema::create('loan_approval_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('step_no')->default(1);
            $table->string('step', 100);
            $table->enum('decision', ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'])->default('PENDING');
            $table->text('note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['loan_application_id', 'step_no']);
            $table->index(['loan_application_id', 'decision']);
        });

        Schema::create('loan_collaterals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id')->nullable()->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('loan_account_id')->nullable()->constrained('loan_accounts')->cascadeOnDelete();
            $table->foreignId('financial_account_id')->nullable()->constrained('financial_accounts')->cascadeOnDelete();
            $table->enum('type', ['DEPOSIT_LIEN', 'PROPERTY', 'VEHICLE', 'GUARANTEE', 'OTHER']);
            $table->string('description', 255);
            $table->decimal('assessed_value', 20, 2)->nullable();
            $table->decimal('secured_value', 20, 2)->nullable();
            $table->enum('status', ['PENDING', 'VERIFIED', 'RELEASED', 'REJECTED'])->default('PENDING');
            $table->date('verified_at')->nullable();
            $table->date('released_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['loan_application_id', 'status']);
            $table->index(['loan_account_id', 'status']);
            $table->index('financial_account_id');
        });

        Schema::create('loan_guarantors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id')->nullable()->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('loan_account_id')->nullable()->constrained('loan_accounts')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->enum('status', ['PENDING', 'ACCEPTED', 'REJECTED', 'RELEASED'])->default('PENDING');
            $table->timestamp('accepted_at')->nullable();
            $table->date('released_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['loan_application_id', 'status']);
            $table->index(['loan_account_id', 'status']);
            $table->index(['customer_id', 'status']);
        });

        Schema::create('loan_disbursements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->decimal('amount', 20, 2);
            $table->date('disbursed_at');
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['loan_account_id', 'status']);
            $table->index(['financial_transaction_id']);
        });

        Schema::create('loan_repayment_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->unsignedInteger('installment_no');
            $table->date('due_date');
            $table->decimal('principal_due', 20, 2);
            $table->decimal('interest_due', 20, 2)->default(0);
            $table->decimal('fine_due', 20, 2)->default(0);
            $table->decimal('total_due', 20, 2)->default(0);
            $table->decimal('principal_paid', 20, 2)->default(0);
            $table->decimal('interest_paid', 20, 2)->default(0);
            $table->decimal('fine_paid', 20, 2)->default(0);
            $table->decimal('total_paid', 20, 2)->default(0);
            $table->date('paid_at')->nullable();
            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'])->default('PENDING');
            $table->timestamps();
            $table->unique(['loan_account_id', 'installment_no'], 'loan_repayment_schedule_unique');
            $table->index(['loan_account_id', 'status']);
            $table->index(['due_date', 'status']);
        });

        Schema::create('loan_repayments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->dateTime('repayment_at');
            $table->decimal('amount', 20, 2);
            $table->decimal('principal_amount', 20, 2)->default(0);
            $table->decimal('interest_amount', 20, 2)->default(0);
            $table->decimal('fine_amount', 20, 2)->default(0);
            $table->decimal('extra_principal_amount', 20, 2)->default(0);
            $table->enum('status', ['PENDING', 'POSTED', 'REVERSED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['loan_account_id', 'repayment_at']);
            $table->index(['financial_transaction_id']);
            $table->index(['loan_account_id', 'status']);
        });

        Schema::create('loan_protection_policies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->unique()->constrained('loan_accounts')->cascadeOnDelete();
            $table->foreignId('loan_protection_product_id')->nullable();
            $table->foreign('loan_protection_product_id', 'la_policy_protection_product_fk')->references('id')->on('loan_protection_products')->nullOnDelete();
            $table->decimal('monthly_rate_percent', 8, 2)->nullable();
            $table->boolean('required')->default(false);
            $table->decimal('coverage_amount', 20, 2)->nullable();
            $table->decimal('initial_fee', 20, 2)->default(0);
            $table->decimal('renewal_fee', 20, 2)->default(0);
            $table->enum('renewal_frequency', ['NONE', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'])->default('NONE');
            $table->date('next_renewal_at')->nullable();
            $table->enum('status', ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'])->default('PENDING');
            $table->timestamps();
            $table->index(['next_renewal_at', 'status']);
        });

        Schema::create('loan_protection_claims', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->string('claim_no', 100)->unique();
            $table->date('death_date');
            $table->string('death_certificate_path', 500);
            $table->string('death_certificate_name', 255);
            $table->enum('status', ['SUBMITTED', 'APPROVED', 'REJECTED', 'SETTLED'])->default('SUBMITTED');
            $table->decimal('payout_amount', 20, 2)->nullable();
            $table->foreignId('payout_account_id')->nullable();
            $table->foreign('payout_account_id', 'la_claim_payout_account_fk')
                ->references('id')->on('financial_accounts')->nullOnDelete();
            $table->foreignId('financial_transaction_id')->nullable();
            $table->foreign('financial_transaction_id', 'la_claim_transaction_fk')
                ->references('id')->on('financial_transactions')->nullOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamps();
            $table->unique('financial_transaction_id', 'la_claim_transaction_unique');
            $table->index(['loan_account_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_protection_claims');
        Schema::dropIfExists('loan_application_supporting_documents');
        Schema::dropIfExists('loan_application_educations');
        Schema::dropIfExists('loan_application_asset_details');
        Schema::dropIfExists('loan_application_job_histories');
        Schema::dropIfExists('loan_application_expense_details');
        Schema::dropIfExists('loan_application_income_details');
        Schema::dropIfExists('loan_protection_policies');
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('loan_repayment_schedules');
        Schema::dropIfExists('loan_disbursements');
        Schema::dropIfExists('loan_guarantors');
        Schema::dropIfExists('loan_collaterals');
        Schema::dropIfExists('loan_approval_steps');
        Schema::dropIfExists('loan_accounts');
        Schema::dropIfExists('loan_applications');
        Schema::dropIfExists('loan_protection_products');
    }
};