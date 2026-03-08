<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['Deposit', 'Loan', 'Share']);
            $table->string('subtype'); // Deposit- (Savings, Reccurring, Fixed), Loan- (Member/Personal Loan, SME, Education, Housing), Share- (Share Capital), Cash- (Drawer Cash, Vault Cash, Bank Cash, Petty Cash)
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->integer('term_months')->nullable();
            $table->boolean('is_active')->default(true);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->unique();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('account_type', ['GL', 'CUSTOMER', 'VENDOR', 'BANK', 'CASH', 'PETTY_CASH']);
            $table->decimal('balance', 18, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'CLOSED', 'FROZEN'])->default('ACTIVE');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        // | account_no | name                      | type |
        // | ---------- | ------------------------- | ---- |
        // | 101        | Vault Cash                | GL   |
        // | 102        | Teller Cash               | GL   |
        // | 201        | Customer Deposits         | GL   |
        // | 301        | Loan Principal Receivable | GL   |
        // | 401        | Loan Interest Income      | GL   |
        // | 501        | Office Expense            | GL   |

        Schema::create('account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained();
            $table->string('holder_type')->default('PRIMARY');
            // PRIMARY, JOINT, AUTHORIZED
            $table->decimal('ownership_percent', 5, 2)->nullable();
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('share_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts');
            $table->integer('shares_owned')->default(0);
            $table->decimal('share_value', 10, 2)->default(0);
            $table->boolean('voting_rights')->default(true);
            $table->timestamps();
        });

        Schema::create('term_deposit_details', function (Blueprint $table) {
            $table->foreignId('account_id')->primary()->constrained('accounts');
            $table->integer('tenure_months');
            $table->decimal('maturity_amount', 15, 2);
            $table->decimal('premature_penalty_rate', 5, 2)->default(0);
            $table->enum('payout_mode', ['MATURITY', 'MONTHLY'])->default('MATURITY');
        });

        Schema::create('recurring_deposit_details', function (Blueprint $table) {
            $table->foreignId('account_id')->primary()->constrained('accounts');
            $table->decimal('installment_amount', 15, 2);
            $table->enum('installment_frequency', ['MONTHLY', 'QUARTERLY', 'ANNUAL'])->default('MONTHLY');
            $table->integer('total_installments');
            $table->integer('paid_installments')->default(0);
            $table->date('next_due_date')->nullable();
            $table->decimal('penalty_rate', 5, 2)->default(0);
            $table->integer('grace_days')->default(0);
            $table->decimal('maturity_amount', 15, 2)->default(0);
        });

        Schema::create('rd_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts');
            $table->integer('installment_no');
            $table->date('due_date');
            $table->decimal('amount_due', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->date('paid_on')->nullable();
            $table->enum('status', ['DUE', 'PAID', 'MISSED'])->default('DUE');
            $table->decimal('penalty_amount', 15, 2)->default(0);
        });

        Schema::create('loan_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts');
            $table->decimal('disbursed_amount', 18, 2);
            $table->date('disbursed_date');
            $table->integer('tenure_months');
            $table->decimal('interest_rate', 5, 2);
            $table->enum('repayment_frequency', ['MONTHLY', 'QUARTERLY', 'WEEKLY'])->default('MONTHLY');
            $table->decimal('current_balance', 18, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'CLOSED', 'DEFAULTED'])->default('ACTIVE');

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

        Schema::create('transaction_types', function (Blueprint $table) {
            $table->id();
            $table->string('type_code', 50)->unique();
            $table->string('type_name', 100)->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no', 50)->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete(); // primary account holder
            $table->foreignId('transaction_type_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('transaction_date')->useCurrent();
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('channel')->nullable(); // teller, mobile, atm, online, system
            $table->string('reference', 150)->nullable();

            $table->foreignId('created_by')->constrained('users');
            $table->enum('status', ['PENDING', 'APPROVED', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('transaction_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->decimal('amount', 18, 2);
            // if account_id is gl then optional subledger reference.. deposit account, loan account, schedule etc
            $table->nullableMorphs('subledger');
            $table->string('component')->nullable(); // 'PRINCIPAL','INTEREST','PENALTY','DEPOSIT','WITHDRAWAL','CASH_IN','CASH_OUT',
            $table->string(column: 'description')->nullable();
            $table->timestamps();
        });

        Schema::create('deposit_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['account_id', 'accrual_date']); // prevent duplicate accrual
        });

        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['account_id', 'accrual_date']);
        });

        Schema::create('loan_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['LATE_PAYMENT', 'PREMATURE_WITHDRAWAL', 'OVERDUE', 'OTHER']);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['account_id', 'penalty_date', 'penalty_type']);
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('loan_penalties');
        Schema::dropIfExists('loan_interest_accruals');
        Schema::dropIfExists('deposit_interest_accruals');
        Schema::dropIfExists('transaction_lines');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('transaction_types');
        Schema::dropIfExists('subledgers');
        Schema::dropIfExists('subledger_types');
    }
};
