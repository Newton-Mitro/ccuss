<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Branch Days
        Schema::create('branch_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('business_date');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['OPEN', 'closed'])->default('OPEN');
            $table->timestamps();
            $table->unique(['branch_id', 'business_date']);
        });

        // Denominations
        Schema::create('denominations', function (Blueprint $table) {
            $table->id();
            $table->integer('value');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Vaults
        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('total_balance', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tellers
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

        // Vault Denominations
        Schema::create('vault_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->foreignId('denomination_id')->constrained()->cascadeOnDelete();
            $table->integer('count')->default(0);
            $table->timestamps();
        });

        // Teller Sessions
        Schema::create('teller_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_cash', 18, 2)->default(0);
            $table->decimal('closing_cash', 18, 2)->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->enum('status', ['OPEN', 'closed'])->default('OPEN');
            $table->timestamps();
        });

        // Cash Transactions
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->constrained()->cascadeOnDelete();
            $table->morphs('source'); // source_type & source_id
            $table->morphs('destination'); // destination_type & destination_id
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']);
            $table->string('reference')->nullable();
            $table->timestamp('transaction_date');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->index('transaction_date');
        });

        // Cash Adjustments
        Schema::create('cash_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['SHORTAGE', 'EXCESS', 'other']);
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Vault Transfers
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->morphs('source');
            $table->morphs('destination');
            $table->decimal('amount', 18, 2);
            $table->timestamp('transfer_date');
            $table->enum('type', ['INTERNAL', 'EXTERNAL']);
            $table->enum('status', ['pending', 'APPROVED', 'rejected'])->default('pending');
            $table->foreignId('initiated_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // Cash Audit Logs
        Schema::create('cash_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->text('details')->nullable();
            $table->timestamp('action_time');
            $table->timestamps();
        });

        // Branch Alerts
        Schema::create('branch_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->enum('severity', ['INFO', 'WARNING', 'CRITICAL'])->default('INFO');
            $table->boolean('read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_alerts');
        Schema::dropIfExists('cash_audit_logs');
        Schema::dropIfExists('vault_transfers');
        Schema::dropIfExists('cash_adjustments');
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('vault_denominations');
        Schema::dropIfExists('tellers');
        Schema::dropIfExists('teller_sessions');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('denominations');
        Schema::dropIfExists('branch_days');
    }
};