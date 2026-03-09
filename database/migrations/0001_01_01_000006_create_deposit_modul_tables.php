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
            $table->enum('type', ['Deposit', 'Loan', 'Share']);
            $table->string('subtype'); // Savings, Reccurring, Fixed
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->decimal('minimum_balance', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
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
    }


    public function down(): void
    {

    }
};
