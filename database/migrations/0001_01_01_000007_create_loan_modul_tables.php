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
            $table->enum('type', ['PERSONAL', 'SME', 'EDUCATION', 'HOUSING']);
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->integer('term_months')->nullable();
            $table->boolean('is_active')->default(true);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->unique();
            $table->foreignId('loan_product_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('disbursed_amount', 18, 2);
            $table->date('disbursed_date');
            $table->integer('tenure_months');
            $table->decimal('interest_rate', 5, 2);
            $table->enum('repayment_frequency', ['MONTHLY', 'QUARTERLY', 'WEEKLY'])->default('MONTHLY');
            $table->decimal('current_balance', 18, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'CLOSED', 'DEFAULTED'])->default('ACTIVE');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained();
            $table->string('holder_type')->default('PRIMARY');
            // PRIMARY, JOINT, AUTHORIZED
            $table->decimal('ownership_percent', 5, 2)->nullable();
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_repayment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->integer('sequence_no');
            $table->date('due_date');
            $table->decimal('principal_due', 18, 2);
            $table->decimal('interest_due', 18, 2);
            $table->decimal('total_due', 18, 2)->storedAs('principal_due + interest_due');
            $table->enum('status', ['PENDING', 'PAID', 'LATE'])->default('PENDING');
            $table->date('paid_date')->nullable();
            $table->timestamps();
        });

        Schema::create('loan_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no')->unique();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->enum('transaction_type', [
                'DISBURSEMENT',
                'REPAYMENT',
                'INTEREST',
                'PENALTY',
                'WRITE_OFF',
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

        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('loan_transaction_id')->nullable()->constrained('loan_transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(
                ['loan_account_id', 'accrual_date'],
                'loan_interest_unique'
            );
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
            $table->unique(
                ['loan_account_id', 'penalty_date', 'penalty_type'],
                'loan_penalty_unique'
            );
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('loan_penalties');
        Schema::dropIfExists('loan_interest_accruals');

        Schema::dropIfExists('loan_account_statements');
        Schema::dropIfExists('loan_transaction_lines');
        Schema::dropIfExists('loan_transactions');

        Schema::dropIfExists('loan_repayment_schedules');

        Schema::dropIfExists('loan_account_holders');
        Schema::dropIfExists('loan_accounts');
        Schema::dropIfExists('loan_products');
    }
};
