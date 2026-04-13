<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            // polymorphic link
            $table->morphs('accountable');
            $table->string('account_number')->unique();
            $table->string('name')->nullable();
            $table->enum('type', ['bank', 'deposit', 'loan', 'petty_cash', 'vendor', 'vault', 'teller', 'customer']); // optional but useful
            $table->decimal('balance', 18, 2)->default(0); // central balance
            $table->enum('status', ['pending', 'active', 'dormant', 'frozen', 'closed'])->default('pending');
            $table->timestamps();
        });

        Schema::create('account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained();
            $table->string('holder_type')->default('primary'); // primary, JOINT, AUTHORIZED
            $table->decimal('ownership_percent', 5, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('account_nominees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('relation');
            $table->date('date_of_birth')->nullable();
            $table->decimal('allocation_percent', 5, 2)->default(100);
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_period_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('debit_total', 18, 2)->default(0);
            $table->decimal('credit_total', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->default(0);
            $table->timestamps();
        });

        // daily provisioning of interest and monthly post to gl account
        Schema::create('deposit_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            // $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();
            $table->timestamps();
            $table->unique(['account_id', 'accrual_date']);
        });

        Schema::create('deposit_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['late_payment', 'premature_withdrawal', 'overdue', 'other']);
            $table->boolean('is_posted')->default(false);
            // $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['account_id', 'penalty_date', 'penalty_type'], 'dep_penalty_unique');
        });

        Schema::create('deposit_account_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('fee_type');
            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['one_time', 'monthly', 'quarterly', 'yearly'])->default('one_time');
            $table->date('applied_on')->nullable();
            $table->boolean('is_paid')->default(false);
            // $table->foreignId('paid_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
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