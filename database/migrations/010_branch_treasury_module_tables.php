<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // -----------------------
        // Branch Days
        // -----------------------
        Schema::create('branch_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('business_date');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->timestamps();
            $table->unique(['branch_id', 'business_date']);
        });

        // -----------------------
        // Denominations
        // -----------------------
        Schema::create('denominations', function (Blueprint $table) {
            $table->id();
            $table->integer('value');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // -----------------------
        // Vaults
        // -----------------------
        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('total_balance', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // -----------------------
        // Tellers
        // -----------------------
        Schema::create('tellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->decimal('max_cash_limit', 18, 2)->default(0);
            $table->decimal('max_transaction_limit', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // -----------------------
        // Vault Denominations
        // -----------------------
        Schema::create('vault_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('denomination_id')->constrained()->cascadeOnDelete();
            $table->integer('count')->default(0);
            $table->timestamps();
        });

        // -----------------------
        // Teller Sessions
        // -----------------------
        Schema::create('teller_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_cash', 18, 2)->default(0);
            $table->decimal('closing_cash', 18, 2)->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->timestamps();
        });

        // -----------------------
        // Vault Transactions
        // -----------------------
        Schema::create('vault_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teller_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['IN', 'OUT']);
            $table->string('reference')->nullable();
            $table->timestamp('transaction_date');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // -----------------------
        // Cash Transactions (linked to teller_sessions)
        // -----------------------
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['CASH_IN', 'CASH_OUT']);
            $table->morphs('source');
            $table->string('reference')->nullable();
            $table->timestamp('transaction_date');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->index('transaction_date');
        });

        // -----------------------
        // Teller Vault Transfers
        // -----------------------
        Schema::create('teller_vault_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teller_session_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['CASH_TO_TELLER', 'CASH_TO_VAULT']);
            $table->timestamp('transfer_date');
            $table->timestamps();
        });

        // -----------------------
        // Vault to Vault Transfers
        // -----------------------
        Schema::create('vault_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_vault_id')->constrained('vaults')->cascadeOnDelete();
            $table->foreignId('to_vault_id')->constrained('vaults')->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->timestamp('transfer_date');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('vault_bank_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['TO_BANK', 'FROM_BANK']); // TO_BANK = deposit, FROM_BANK = withdrawal
            $table->enum('payment_method', ['CASH', 'CHEQUE']);
            $table->string('cheque_number')->nullable();
            $table->timestamp('transfer_date');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // -----------------------
        // Cash Balancing
        // -----------------------
        Schema::create('cash_balancings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->constrained()->cascadeOnDelete();
            $table->decimal('expected_balance', 18, 2);
            $table->decimal('actual_balance', 18, 2);
            $table->decimal('difference', 18, 2);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('balanced_at');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // -----------------------
        // Cash Adjustments
        // -----------------------
        Schema::create('cash_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['SHORTAGE', 'EXCESS']);
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // -----------------------
        // Cash Audit Logs
        // -----------------------
        Schema::create('cash_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->text('details')->nullable();
            $table->timestamp('action_time');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_audit_logs');
        Schema::dropIfExists('cash_adjustments');
        Schema::dropIfExists('cash_balancings');
        Schema::dropIfExists('vault_transfers');
        Schema::dropIfExists('teller_vault_transfers');
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('vault_transactions');
        Schema::dropIfExists('vault_denominations');
        Schema::dropIfExists('denominations');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('teller_sessions');
        Schema::dropIfExists('tellers');
        Schema::dropIfExists('branch_days');
    }
};