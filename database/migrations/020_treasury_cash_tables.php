<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cash_locations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_account_id')->nullable()->constrained('financial_accounts')->nullOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('type', ['VAULT', 'TELLER', 'PETTY_CASH', 'OTHER']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
            $table->index(['branch_id', 'type']);
        });

        Schema::create('vaults', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cash_location_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->decimal('maximum_balance', 20, 4)->nullable();
            $table->timestamps();
            $table->unique('code');
        });

        Schema::create('tellers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cash_location_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->decimal('maximum_cash', 20, 4)->nullable();
            $table->timestamps();
            $table->unique('code');
        });

        Schema::create('teller_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teller_id')->constrained()->restrictOnDelete();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['OPEN', 'CLOSING', 'CLOSED'])->default('OPEN');
            $table->decimal('opening_cash', 20, 4)->default(0);
            $table->text('opening_note')->nullable();
            $table->decimal('closing_cash', 20, 4)->nullable();
            $table->decimal('expected_cash', 20, 4)->nullable();
            $table->decimal('cash_difference', 20, 4)->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('closing_note')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'teller_id']);
        });

        Schema::create('cash_denominations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('currency', 10)->default('BDT');
            $table->enum('type', ['NOTE', 'COIN'])->default('NOTE');
            $table->decimal('value', 20, 4);
            $table->string('name', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['organization_id', 'currency', 'value', 'type']);
        });

        Schema::create('cash_counts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['OPENING', 'CLOSING', 'TRANSFER_OUT', 'TRANSFER_IN', 'VERIFICATION', 'ADJUSTMENT']);
            $table->decimal('total_amount', 20, 4)->default(0);
            $table->foreignId('counted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('counted_at');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['cash_location_id', 'counted_at']);
        });

        Schema::create('cash_count_denominations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cash_count_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_denomination_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->decimal('amount', 20, 4)->default(0);
            $table->timestamps();
            $table->unique(['cash_count_id', 'cash_denomination_id'], 'cash_count_denomination_unique');
        });

        Schema::create('cash_transfers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_cash_location_id')->constrained('cash_locations')->restrictOnDelete();
            $table->foreignId('to_cash_location_id')->constrained('cash_locations')->restrictOnDelete();
            $table->decimal('amount', 20, 4);
            $table->string('transfer_no', 100);
            $table->enum('status', ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'transfer_no']);
        });

        Schema::create('petty_cash_funds', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cash_location_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('custodian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->decimal('fund_limit', 20, 4);
            $table->decimal('current_balance', 20, 4)->default(0);
            $table->enum('method', ['IMPREST', 'VARIABLE'])->default('IMPREST');
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->timestamps();
            $table->unique('code');
        });

        Schema::create('petty_cash_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('petty_cash_fund_id')->constrained()->restrictOnDelete();
            $table->string('transaction_no', 100);
            $table->enum('type', ['FUNDING', 'EXPENSE', 'REPLENISHMENT', 'RETURN', 'ADJUSTMENT']);
            $table->decimal('amount', 20, 4);
            $table->string('payee')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('expense_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['branch_day_id', 'transaction_no']);
        });

        Schema::create('branch_cash_summaries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('opening_cash', 20, 4)->default(0);
            $table->decimal('cash_received', 20, 4)->default(0);
            $table->decimal('cash_paid', 20, 4)->default(0);
            $table->decimal('vault_balance', 20, 4)->default(0);
            $table->decimal('teller_balance', 20, 4)->default(0);
            $table->decimal('petty_cash_balance', 20, 4)->default(0);
            $table->decimal('closing_cash', 20, 4)->default(0);
            $table->decimal('cash_difference', 20, 4)->default(0);
            $table->timestamps();
        });

        Schema::create('cash_adjustments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 20, 4);
            $table->enum('type', ['SHORTAGE', 'EXCESS']);
            $table->text('reason');
            $table->enum('status', ['PENDING', 'APPROVED', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('teller_cash_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->string('transaction_no', 100);
            $table->enum('type', ['DEPOSIT', 'WITHDRAWAL']);
            $table->decimal('amount', 20, 4);
            $table->enum('status', ['PENDING', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->string('reference')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'transaction_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teller_cash_transactions');
        Schema::dropIfExists('cash_adjustments');
        Schema::dropIfExists('branch_cash_summaries');
        Schema::dropIfExists('petty_cash_transactions');
        Schema::dropIfExists('petty_cash_funds');
        Schema::dropIfExists('cash_transfers');
        Schema::dropIfExists('cash_count_denominations');
        Schema::dropIfExists('cash_counts');
        Schema::dropIfExists('cash_denominations');
        Schema::dropIfExists('teller_sessions');
        Schema::dropIfExists('tellers');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('cash_locations');
    }
};
