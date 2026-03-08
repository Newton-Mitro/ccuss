<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | PRODUCTS
        |--------------------------------------------------------------------------
        */
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['DEPOSIT', 'LOAN', 'SHARE']);
            $table->enum('subtype', [
                'SAVINGS',
                'RECURRING',
                'FIXED',
                'PERSONAL_LOAN',
                'SME_LOAN',
                'EDUCATION_LOAN',
                'HOUSING_LOAN',
                'SHARE_CAPITAL'
            ]);
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->integer('term_months')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | SUBLEDGER ACCOUNTS
        |--------------------------------------------------------------------------
        */
        Schema::create('subledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->unique();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->enum('account_type', ['GL', 'CUSTOMER', 'VENDOR', 'BANK', 'CASH', 'PETTY_CASH']);
            $table->decimal('current_balance', 18, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'CLOSED', 'FROZEN'])->default('ACTIVE');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index('product_id');
            $table->index('branch_id');
        });

        /*
        |--------------------------------------------------------------------------
        | ACCOUNT HOLDERS
        |--------------------------------------------------------------------------
        */
        Schema::create('account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers');
            $table->enum('holder_type', ['PRIMARY', 'JOINT', 'AUTHORIZED'])->default('PRIMARY');
            $table->decimal('ownership_percent', 5, 2)->nullable();
            $table->timestamps();
            $table->unique(['subledger_account_id', 'customer_id']);
        });

        /*
        |--------------------------------------------------------------------------
        | SHARE ACCOUNTS
        |--------------------------------------------------------------------------
        */
        Schema::create('share_accounts', function (Blueprint $table) {
            $table->foreignId('subledger_account_id')->primary()->constrained('subledger_accounts')->cascadeOnDelete();
            $table->integer('shares_owned')->default(0);
            $table->decimal('share_value', 10, 2)->default(0);
            $table->boolean('voting_rights')->default(true);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | TERM DEPOSIT DETAILS
        |--------------------------------------------------------------------------
        */
        Schema::create('term_deposit_details', function (Blueprint $table) {
            $table->foreignId('subledger_account_id')->primary()->constrained('subledger_accounts')->cascadeOnDelete();
            $table->integer('tenure_months');
            $table->decimal('maturity_amount', 15, 2);
            $table->decimal('premature_penalty_rate', 5, 2)->default(0);
            $table->enum('payout_mode', ['MATURITY', 'MONTHLY'])->default('MATURITY');
        });

        /*
        |--------------------------------------------------------------------------
        | RECURRING DEPOSIT DETAILS
        |--------------------------------------------------------------------------
        */
        Schema::create('recurring_deposit_details', function (Blueprint $table) {
            $table->foreignId('subledger_account_id')->primary()->constrained('subledger_accounts')->cascadeOnDelete();
            $table->decimal('installment_amount', 15, 2);
            $table->enum('installment_frequency', ['MONTHLY', 'QUARTERLY', 'ANNUAL'])->default('MONTHLY');
            $table->integer('total_installments');
            $table->integer('paid_installments')->default(0);
            $table->date('next_due_date')->nullable();
            $table->decimal('penalty_rate', 5, 2)->default(0);
            $table->integer('grace_days')->default(0);
            $table->decimal('maturity_amount', 15, 2)->default(0);
        });

        /*
        |--------------------------------------------------------------------------
        | LOAN ACCOUNTS
        |--------------------------------------------------------------------------
        */
        Schema::create('loan_accounts', function (Blueprint $table) {
            $table->foreignId('subledger_account_id')->primary()->constrained('subledger_accounts')->cascadeOnDelete();
            $table->decimal('disbursed_amount', 18, 2);
            $table->date('disbursed_date');
            $table->integer('tenure_months');
            $table->decimal('interest_rate', 5, 2);
            $table->enum('repayment_frequency', ['MONTHLY', 'WEEKLY', 'QUARTERLY'])->default('MONTHLY');
            $table->decimal('current_balance', 18, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'CLOSED', 'DEFAULTED'])->default('ACTIVE');
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | LOAN REPAYMENT SCHEDULES
        |--------------------------------------------------------------------------
        */
        Schema::create('loan_repayment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_account_id')->constrained('loan_accounts')->cascadeOnDelete();
            $table->integer('sequence_no');
            $table->date('due_date');
            $table->decimal('principal_due', 18, 2);
            $table->decimal('interest_due', 18, 2);
            $table->decimal('total_due', 18, 2)->storedAs('principal_due + interest_due');
            $table->enum('status', ['PENDING', 'PAID', 'LATE'])->default('PENDING');
            $table->date('paid_date')->nullable();
            $table->timestamps();
            $table->unique(['loan_account_id', 'sequence_no']);
        });

        /*
        |--------------------------------------------------------------------------
        | TELLERS
        |--------------------------------------------------------------------------
        */
        Schema::create('tellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | VAULTS
        |--------------------------------------------------------------------------
        */
        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts');
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('total_balance', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | VAULT DENOMINATIONS
        |--------------------------------------------------------------------------
        */
        Schema::create('vault_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->integer('denomination');
            $table->integer('count')->default(0);
            $table->decimal('total', 18, 2)->storedAs('denomination * count');
            $table->timestamps();
            $table->unique(['vault_id', 'denomination']);
        });

        /*
        |--------------------------------------------------------------------------
        | CASH DRAWERS
        |--------------------------------------------------------------------------
        */
        Schema::create('cash_drawers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts');
            $table->foreignId('teller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('business_date');
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->timestamps();
            $table->unique(['teller_id', 'business_date']);
        });

        /*
        |--------------------------------------------------------------------------
        | PETTY CASH
        |--------------------------------------------------------------------------
        */
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subledger_account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | INTEREST ACCRUALS
        |--------------------------------------------------------------------------
        */
        Schema::create('deposit_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->timestamps();
            $table->unique(['subledger_account_id', 'accrual_date']);
        });

        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->timestamps();
            $table->unique(['subledger_account_id', 'accrual_date']);
        });

        /*
        |--------------------------------------------------------------------------
        | LOAN PENALTIES
        |--------------------------------------------------------------------------
        */
        Schema::create('loan_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['LATE_PAYMENT', 'PREMATURE_WITHDRAWAL', 'OVERDUE', 'OTHER']);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['subledger_account_id', 'penalty_date', 'penalty_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_penalties');
        Schema::dropIfExists('loan_interest_accruals');
        Schema::dropIfExists('deposit_interest_accruals');
        Schema::dropIfExists('petty_cash_accounts');
        Schema::dropIfExists('cash_drawers');
        Schema::dropIfExists('vault_denominations');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('tellers');
        Schema::dropIfExists('loan_repayment_schedules');
        Schema::dropIfExists('loan_accounts');
        Schema::dropIfExists('recurring_deposit_details');
        Schema::dropIfExists('term_deposit_details');
        Schema::dropIfExists('share_accounts');
        Schema::dropIfExists('account_holders');
        Schema::dropIfExists('subledger_accounts');
        Schema::dropIfExists('products');
    }
};