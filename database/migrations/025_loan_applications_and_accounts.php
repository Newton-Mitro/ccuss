<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loan_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('financial_product_id')->constrained('financial_products')->restrictOnDelete();
            $table->string('application_no', 100);
            $table->decimal('requested_amount', 20, 4);
            $table->decimal('approved_amount', 20, 4)->nullable();
            $table->unsignedInteger('requested_term_months')->nullable();
            $table->text('purpose')->nullable();
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'])->default('DRAFT');
            $table->date('applied_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('decision_note')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'application_no']);
            $table->index(['customer_id', 'status']);
            $table->index(['financial_product_id', 'status']);
        });

        Schema::create('loan_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('financial_product_id')->constrained('financial_products')->restrictOnDelete();
            $table->foreignId('loan_application_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('loan_no', 100);
            $table->decimal('principal_amount', 20, 4);
            $table->decimal('disbursed_amount', 20, 4)->default(0);
            $table->decimal('contractual_rate', 12, 6);
            $table->enum('interest_calculation', ['SIMPLE', 'FLAT', 'REDUCING_BALANCE']);
            $table->unsignedInteger('term_months');
            $table->date('approved_at')->nullable();
            $table->date('disbursed_at')->nullable();
            $table->date('maturity_date')->nullable();
            $table->enum('status', ['APPROVED', 'PARTIALLY_DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED', 'WRITTEN_OFF'])->default('APPROVED');
            $table->timestamps();
            $table->unique('loan_no');
            $table->index(['customer_id', 'status']);
            $table->index(['maturity_date', 'status']);
        });

        Schema::create('loan_approval_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('step', 100);
            $table->enum('decision', ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'])->default('PENDING');
            $table->text('note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->index(['loan_application_id', 'decision']);
        });

        Schema::create('loan_collaterals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('loan_account_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('type', ['DEPOSIT_LIEN', 'PROPERTY', 'VEHICLE', 'GUARANTEE', 'OTHER']);
            $table->string('description', 255);
            $table->decimal('assessed_value', 20, 4)->nullable();
            $table->decimal('secured_value', 20, 4)->nullable();
            $table->enum('status', ['PENDING', 'VERIFIED', 'RELEASED', 'REJECTED'])->default('PENDING');
            $table->date('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['loan_application_id', 'status']);
            $table->index(['loan_account_id', 'status']);
        });

        Schema::create('loan_guarantors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_application_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('loan_account_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->enum('status', ['PENDING', 'ACCEPTED', 'REJECTED', 'RELEASED'])->default('PENDING');
            $table->timestamp('accepted_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['customer_id', 'status']);
        });

        Schema::create('loan_disbursements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->decimal('amount', 20, 4);
            $table->date('disbursed_at');
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['loan_account_id', 'financial_transaction_id'], 'loan_disbursement_transaction_unique');
            $table->index(['loan_account_id', 'status']);
        });

        Schema::create('loan_protection_policies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('required')->default(false);
            $table->decimal('coverage_amount', 20, 4)->nullable();
            $table->decimal('initial_fee', 20, 4)->default(0);
            $table->decimal('renewal_fee', 20, 4)->default(0);
            $table->enum('renewal_frequency', ['NONE', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'])->default('NONE');
            $table->date('next_renewal_at')->nullable();
            $table->enum('status', ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'])->default('PENDING');
            $table->timestamps();
            $table->index(['next_renewal_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_protection_policies');
        Schema::dropIfExists('loan_disbursements');
        Schema::dropIfExists('loan_guarantors');
        Schema::dropIfExists('loan_collaterals');
        Schema::dropIfExists('loan_approval_steps');
        Schema::dropIfExists('loan_accounts');
        Schema::dropIfExists('loan_applications');
    }
};
