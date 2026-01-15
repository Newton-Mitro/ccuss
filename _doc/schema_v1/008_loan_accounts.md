```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Loan Accounts
         */
        Schema::create('loan_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('policy_id')->constrained('loan_policies');

            $table->decimal('disbursed_amount', 18, 2);
            $table->date('disbursed_date');
            $table->integer('tenure_months');
            $table->decimal('interest_rate', 5, 2);

            $table->enum('repayment_frequency', ['MONTHLY','QUARTERLY','WEEKLY'])
                  ->default('MONTHLY');

            $table->enum('status', ['ACTIVE','CLOSED','DEFAULTED'])
                  ->default('ACTIVE');

            $table->decimal('current_balance', 18, 2)->default(0);

            $table->foreignId('protection_scheme_id')->nullable()
                  ->constrained('loan_protection_schemes');

            $table->foreignId('gl_loan_receivable_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_interest_receivable_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_interest_income_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_loan_fee_id')->nullable()
                  ->constrained('gl_accounts');

            $table->timestamps();
        });

        /**
         * Loan Protection Schemes
         */
        Schema::create('loan_protection_schemes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->string('scheme_name', 150);
            $table->decimal('coverage_amount', 18, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('premium_amount', 18, 2);
            $table->decimal('renewal_fee', 18, 2)->default(0);

            $table->enum('status', ['ACTIVE','EXPIRED','LAPSED'])
                  ->default('ACTIVE');

            $table->foreignId('gl_protection_scheme_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_loan_fee_id')->nullable()
                  ->constrained('gl_accounts');

            $table->timestamps();
        });

        /**
         * Loan Protection Transactions
         */
        Schema::create('loan_protection_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('protection_scheme_id')
                  ->constrained('loan_protection_schemes')
                  ->cascadeOnDelete();

            $table->date('txn_date');
            $table->string('description')->nullable();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2)->default(0);
            $table->string('reference_no', 50)->nullable();

            $table->foreignId('gl_cash_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_loan_fee_id')->nullable()
                  ->constrained('gl_accounts');

            $table->timestamps();
        });

        /**
         * Loan Schedules
         */
        Schema::create('loan_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->integer('sequence_no');
            $table->date('due_date');

            $table->decimal('principal_due', 18, 2);
            $table->decimal('interest_due', 18, 2);

            $table->decimal('total_due', 18, 2)
                  ->storedAs('principal_due + interest_due');

            $table->enum('status', ['PENDING','PAID','LATE'])
                  ->default('PENDING');

            $table->date('paid_date')->nullable();
            $table->timestamps();
        });

        /**
         * Loan Payments
         */
        Schema::create('loan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();

            $table->date('txn_date');
            $table->string('description')->nullable();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2)->default(0);
            $table->string('reference_no', 50)->nullable();

            $table->foreignId('gl_control_account_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_interest_receivable_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_interest_income_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_loan_fee_id')->nullable()
                  ->constrained('gl_accounts');

            $table->timestamps();
        });

        /**
         * Loan Penalties
         */
        Schema::create('loan_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_schedule_id')->nullable()
                  ->constrained('loan_schedules');

            $table->date('txn_date');
            $table->string('description')->nullable();
            $table->decimal('penalty_amount', 18, 2);

            $table->boolean('received_as_cash')->default(true);
            $table->boolean('settled')->default(true);

            $table->foreignId('gl_loan_fee_id')->nullable()
                  ->constrained('gl_accounts');

            $table->timestamps();
        });

        /**
         * Loan Interest Accruals
         */
        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->date('provision_date');
            $table->decimal('provision_amount', 18, 2);
            $table->boolean('recognized')->default(false);

            $table->foreignId('gl_interest_receivable_id')->nullable()
                  ->constrained('gl_accounts');

            $table->foreignId('gl_interest_income_id')->nullable()
                  ->constrained('gl_accounts');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_interest_accruals');
        Schema::dropIfExists('loan_penalties');
        Schema::dropIfExists('loan_payments');
        Schema::dropIfExists('loan_schedules');
        Schema::dropIfExists('loan_protection_transactions');
        Schema::dropIfExists('loan_protection_schemes');
        Schema::dropIfExists('loan_accounts');
    }
};
```
