```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('branch_code', 10);
            $table->string('product_code', 10);
            $table->string('account_type', 10);
            $table->integer('year');
            $table->unsignedBigInteger('last_number')->default(0);

            $table->unique([
                'branch_code',
                'product_code',
                'account_type',
                'year'
            ]);
        });

        /**
         * Deposit Accounts
         */
        Schema::create('deposit_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->unique();
            $table->string('account_name', 100);
            $table->foreignId('deposit_product_id')->constrained('deposit_products');
            $table->date('opened_date');
            $table->date('maturity_date')->nullable();
            $table->integer('tenure_months')->nullable();
            $table->decimal('installment_amount', 18, 2)->nullable();
            $table->enum('status', ['OPEN','FROZEN','DORMANT','CLOSED'])->default('OPEN');
            $table->decimal('current_balance', 18, 2)->default(0);
            $table->date('last_interest_posted')->nullable();
            $table->timestamps();
        });

        /**
         * Deposit Account Holders
         */
        Schema::create('deposit_account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('holder_customer_id')->nullable()->constrained('customers');
             $table->string('name', 100);
            $table->enum('role', [
                'PRIMARY_HOLDER',
                'JOINT_HOLDER',
                'AUTHORIZED_SIGNATORY'
            ]);
            $table->timestamps();
        });

        /**
         * Deposit Account Nominees
         */
        Schema::create('deposit_account_nominees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('nominee_customer_id')->nullable()->constrained('customers');
            $table->string('name', 100);
            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER'])->nullable();
            $relations = [
                'FATHER','MOTHER','SON','DAUGHTER','BROTHER','COUSIN_BROTHER','COUSIN_SISTER','SISTER','HUSBAND','WIFE',
                'GRANDFATHER','GRANDMOTHER','GRANDSON','GRANDDAUGHTER','UNCLE','AUNT','NEPHEW','NIECE',
                'FATHER-IN-LAW','MOTHER-IN-LAW','SON-IN-LAW','DAUGHTER-IN-LAW','BROTHER-IN-LAW','SISTER-IN-LAW'
            ];
            $table->enum('relation', $relations);
            $table->decimal('share_percentage', 5, 2)->default(0);
            $table->timestamps();
        });

        /**
         * Deposit Account Schedules
         */
        Schema::create('deposit_account_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->integer('sequence_no');
            $table->date('due_date');
            $table->decimal('amount_due', 18, 2);
            $table->enum('status', ['PENDING','PAID','LATE'])->default('PENDING');
            $table->date('paid_date')->nullable();
            $table->timestamps();
        });

        /**
         * Deposit Account Transactions (Mandatory - Source of truth)
         */
        Schema::create('deposit_account_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gl_deposit_payable_id')->nullable()->constrained('ledger_accounts');
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_schedule_id')->nullable()->constrained('deposit_account_schedules');

            $table->date('txn_date');
            $table->string('description')->nullable();
            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);
            $table->decimal('balance', 18, 2)->default(0);
            $table->string('reference_no', 50)->nullable();
            $table->enum('transaction_type', [
                'DEPOSIT',
                'WITHDRAWAL',
                'INTEREST',
                'FEE',
                'TRANSFER'
            ])->default('DEPOSIT');

            $table->timestamps();
        });

        /**
         * Deposit Account Fees
         */
        Schema::create('deposit_account_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gl_fee_income_id')->nullable()->constrained('ledger_accounts');
            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();

            $table->date('txn_date');
            $table->string('description')->nullable();
            $table->enum('fee_type', [
                'INACTIVITY',
                'MAINTENANCE',
                'CLOSURE',
                'TRANSFER',
                'OTHER'
            ])->default('MAINTENANCE');
            $table->decimal('amount', 18, 2);
            $table->enum('status', ['PENDING','WAIVED','POSTED'])->default('PENDING');

            $table->timestamps();
        });


        Schema::create('deposit_account_fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained();
            $table->foreignId('deposit_fine_policy_id')->constrained();
            $table->foreignId('related_schedule_id')->nullable()->constrained('deposit_account_schedules');

            $table->enum('fine_type', [
                'LATE_PAYMENT',
                'CLOSURE',
                'OTHER'
            ])->default('LATE_PAYMENT');

            $table->date('event_date');
            $table->decimal('fine_amount', 15, 2);

            $table->enum('status', ['PENDING','WAIVED','POSTED'])->default('PENDING');
            $table->foreignId('voucher_id')->nullable()->constrained();

            $table->foreignId('waived_by')->nullable()->constrained('users');
            $table->timestamp('waived_at')->nullable();

            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        /**
         * Deposit Interest Provision Runs
         */
        Schema::create('deposit_interest_provision_runs', function (Blueprint $table) {
            $table->id();
            $table->date('run_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['PENDING','POSTED','CANCELLED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        /**
         * Deposit Interest Provisions
         */
        Schema::create('deposit_interest_provisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provision_run_id')
                  ->constrained('deposit_interest_provision_runs')
                  ->cascadeOnDelete();

            $table->foreignId('deposit_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gl_interest_payable_id')->nullable()->constrained('ledger_accounts');
            $table->foreignId('gl_interest_expense_id')->nullable()->constrained('ledger_accounts');

            $table->date('provision_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('eligible')->default(true);
            $table->boolean('recognized')->default(false);
            $table->enum('status', ['PENDING','POSTED','REVERSED'])->default('PENDING');
            $table->string('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_interest_provisions');
        Schema::dropIfExists('deposit_interest_provision_runs');
        Schema::dropIfExists('deposit_account_fees');
        Schema::dropIfExists('deposit_account_transactions');
        Schema::dropIfExists('deposit_account_schedules');
        Schema::dropIfExists('deposit_account_nominees');
        Schema::dropIfExists('deposit_account_holders');
        Schema::dropIfExists('deposit_accounts');
    }
};
```
