<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('subledgers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['deposit', 'loan', 'cash', 'payable', 'receivable'])->default('deposit');
            $table->enum('sub_type', [
                'saving deposit',
                'term deposit',
                'recurring deposit',
                'share_deposit',
                'membr_loan',
                'vehicle_loan',
                'home_loan',
                'smb_loan',
                'educational_loan',
                'agri_loan',
                'cash_at_hand',
                'cash_at_bank',
                'petty_cash'
            ])->default('saving deposit');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('gl_account_id')->constrained('ledger_accounts');
        });

        Schema::create('subledger_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subledger_id')->constrained('subledgers')->cascadeOnDelete();
            $table->foreignId('gl_account_id')->constrained('ledger_accounts');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('subledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->morphs('accountable');
            $table->string('account_number')->unique();
            $table->string('name')->nullable();
            $table->enum('type', ['bank', 'deposit', 'loan', 'petty_cash', 'petty_cash_advance', 'vendor', 'vault', 'teller', 'customer']);
            $table->enum('status', ['pending', 'active', 'dormant', 'frozen', 'closed'])->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subledger_id')->nullable()->constrained('subledgers')->nullOnDelete();
        });

        Schema::create('account_holders', function (Blueprint $table) {
            $table->id();
            $table->string('holder_type')->default('primary'); // primary, JOINT, AUTHORIZED
            $table->decimal('ownership_percent', 5, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
        });

        Schema::create('account_nominees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('relation');
            $table->date('date_of_birth')->nullable();
            $table->decimal('allocation_percent', 5, 2)->default(100);
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
        });

        Schema::create('account_balances', function (Blueprint $table) {
            $table->id();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('debit_total', 18, 2)->default(0);
            $table->decimal('credit_total', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
            $table->foreignId('fiscal_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
        });

        // daily provisioning of interest and monthly post to gl account
        Schema::create('deposit_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            // $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();

            $table->unique(['subledger_account_id', 'accrual_date'], 'dep_interest_accrual_unique');
        });

        Schema::create('deposit_penalties', function (Blueprint $table) {
            $table->id();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['late_payment', 'premature_withdrawal', 'overdue', 'other']);
            $table->boolean('is_posted')->default(false);
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            // $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();

            $table->unique(['subledger_account_id', 'penalty_date', 'penalty_type'], 'dep_penalty_unique');
        });

        Schema::create('deposit_account_fees', function (Blueprint $table) {
            $table->id();
            $table->string('fee_type');
            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['one_time', 'monthly', 'quarterly', 'yearly'])->default('one_time');
            $table->date('applied_on')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('subledger_account_id')->constrained('subledger_accounts')->cascadeOnDelete();
            // $table->foreignId('paid_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('account_nominees');
        Schema::dropIfExists('account_balances');
        Schema::dropIfExists('deposit_interest_accruals');
        Schema::dropIfExists('deposit_penalties');
        Schema::dropIfExists('deposit_account_fees');
    }
};