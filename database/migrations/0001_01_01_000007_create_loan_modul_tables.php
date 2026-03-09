<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // ========================
        // 1. Loan Products
        // ========================
        Schema::create('loan_products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['PERSONAL', 'SME', 'EDUCATION', 'HOUSING']);
            $table->decimal('interest_rate', 5, 2)->default(0);
            $table->decimal('min_amount', 15, 2)->default(0);
            $table->decimal('max_amount', 15, 2)->default(0);
            $table->integer('max_tenure_months')->default(12);
            $table->enum('repayment_frequency', ['DAILY', 'WEEKLY', 'MONTHLY'])->default('MONTHLY');
            $table->decimal('processing_fee', 15, 2)->default(0);
            $table->decimal('penalty_rate', 5, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // ========================
        // 2. Loan Applications
        // ========================
        Schema::create('loan_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no', 50)->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->decimal('applied_amount', 15, 2);
            $table->integer('applied_tenure');
            $table->text('purpose')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->timestamps();
        });

        // ========================
        // 3. Loan Documents
        // ========================
        Schema::create('loan_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_application_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('file_path');
            $table->timestamps();
        });

        // ========================
        // 4. Loan Approvals
        // ========================
        Schema::create('loan_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('approved_amount', 15, 2);
            $table->integer('approved_tenure')->nullable();
            $table->text('approval_notes')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
            $table->unique(['loan_application_id'], 'loan_approval_unique');
        });

        // ========================
        // 5. Loan Accounts
        // ========================
        Schema::create('loan_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 30)->unique();
            $table->string('account_name');
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->integer('tenure_months');
            $table->enum('repayment_frequency', ['DAILY', 'WEEKLY', 'MONTHLY'])->default('MONTHLY');
            $table->decimal('installment_amount', 15, 2)->nullable();
            $table->date('disbursement_date')->nullable();
            $table->date('first_installment_date')->nullable();
            $table->date('maturity_date')->nullable();
            $table->decimal('principal_outstanding', 15, 2)->default(0);
            $table->decimal('interest_outstanding', 15, 2)->default(0);
            $table->decimal('penalty_outstanding', 15, 2)->default(0);
            $table->enum('status', ['PENDING', 'APPROVED', 'ACTIVE', 'CLOSED', 'DEFAULTED', 'WRITTEN_OFF'])->default('PENDING');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // ========================
        // 6. Collateral & Guarantors
        // ========================
        Schema::create('loan_collaterals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['LAND', 'GOLD', 'VEHICLE', 'OTHER']);
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
            $table->enum('role', ['PRIMARY', 'CO_BORROWER'])->default('PRIMARY');
            $table->decimal('liability_percentage', 5, 2)->default(100);
            $table->timestamps();
            $table->unique(['loan_account_id', 'customer_id']);
        });

        // ========================
        // 7. Repayment Schedules
        // ========================
        Schema::create('loan_repayment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->integer('installment_no');
            $table->date('due_date');
            $table->decimal('principal', 15, 2);
            $table->decimal('interest', 15, 2);
            $table->decimal('penalty', 15, 2)->default(0);
            $table->decimal('total_due', 15, 2);
            $table->enum('status', ['PENDING', 'PAID', 'LATE'])->default('PENDING');
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

        // ========================
        // 8. Repayments & Transactions
        // ========================
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

        Schema::create('loan_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no')->unique();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->enum('transaction_type', ['DISBURSEMENT', 'REPAYMENT', 'INTEREST', 'PENALTY', 'WRITE_OFF', 'REVERSAL']);
            $table->decimal('amount', 18, 2);
            $table->decimal('balance_after', 18, 2)->nullable();
            $table->dateTime('transaction_date');
            $table->string('reference_no')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_transaction_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_account_id')->constrained();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_account_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_transaction_id')->constrained()->cascadeOnDelete();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2);
            $table->dateTime('posted_at');
            $table->timestamps();
        });

        // ========================
        // 9. Disbursement
        // ========================
        Schema::create('loan_disbursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete();
            $table->decimal('disbursement_amount', 18, 2);
            $table->date('disbursement_date');
            $table->string('reference_no')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['loan_account_id', 'disbursement_date'], 'loan_disbursement_unique');
        });

        // ========================
        // 10. Interest, Penalties, Charges, Write-offs
        // ========================
        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['loan_account_id', 'accrual_date'], 'loan_interest_unique');
        });

        Schema::create('loan_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['LATE_PAYMENT', 'PREMATURE_WITHDRAWAL', 'OVERDUE', 'OTHER']);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['loan_account_id', 'penalty_date', 'penalty_type'], 'loan_penalty_unique');
        });

        Schema::create('loan_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('amount', 15, 2)->default(0);
            $table->enum('charge_type', ['PROCESSING', 'INSURANCE', 'DOCUMENTATION', 'OTHER'])->default('OTHER');
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
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_writeoffs');
        Schema::dropIfExists('loan_charges');
        Schema::dropIfExists('loan_penalties');
        Schema::dropIfExists('loan_interest_accruals');
        Schema::dropIfExists('loan_account_statements');
        Schema::dropIfExists('loan_transaction_lines');
        Schema::dropIfExists('loan_transactions');
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