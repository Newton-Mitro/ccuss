<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('banks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('short_name', 50)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'code']);
        });

        Schema::create('bank_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('bank_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('account_name', 200);
            $table->string('account_number', 100);
            $table->string('routing_number', 100)->nullable();
            $table->enum('account_type', ['CURRENT', 'SAVINGS', 'FDR', 'OTHER'])->default('CURRENT');
            $table->decimal('opening_balance', 20, 4)->default(0);
            $table->boolean('is_reconcilable')->default(true);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'CLOSED'])->default('ACTIVE');
            $table->timestamps();
            $table->unique(['organization_id', 'account_number']);
            $table->index(['branch_id', 'bank_id']);
        });

        Schema::create('bank_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained()->restrictOnDelete();
            $table->string('transaction_no', 100);
            $table->enum('type', ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'CHARGE', 'INTEREST', 'ADJUSTMENT']);
            $table->decimal('amount', 20, 4);
            $table->date('transaction_date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->decimal('balance_after', 20, 4)->nullable();
            $table->enum('status', ['PENDING', 'POSTED', 'RECONCILED', 'CANCELLED'])->default('PENDING');
            $table->timestamps();
            $table->unique(['bank_account_id', 'transaction_no']);
            $table->index(['bank_account_id', 'transaction_date']);
        });

        Schema::create('bank_reconciliations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->date('statement_date');
            $table->decimal('statement_balance', 20, 4);
            $table->decimal('book_balance', 20, 4);
            $table->decimal('difference', 20, 4);
            $table->enum('status', ['OPEN', 'RECONCILED'])->default('OPEN');
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reconciled_at')->nullable();
            $table->timestamps();
            $table->unique(['bank_account_id', 'statement_date']);
        });

        Schema::create('cheque_books', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->string('book_no', 100);
            $table->string('prefix', 50)->nullable();
            $table->unsignedBigInteger('start_number');
            $table->unsignedBigInteger('end_number');
            $table->unsignedBigInteger('current_number')->nullable();
            $table->unsignedInteger('leaf_count');
            $table->date('issued_date')->nullable();
            $table->enum('status', ['AVAILABLE', 'IN_USE', 'EXHAUSTED', 'CANCELLED'])->default('AVAILABLE');
            $table->timestamps();
            $table->unique(['bank_account_id', 'book_no']);
        });

        Schema::create('cheques', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cheque_book_id')->constrained()->cascadeOnDelete();
            $table->string('cheque_no', 100);
            $table->enum('status', ['UNUSED', 'ISSUED', 'PRESENTED', 'CLEARED', 'BOUNCED', 'STOPPED', 'CANCELLED', 'EXPIRED'])->default('UNUSED');
            $table->date('issue_date')->nullable();
            $table->date('cheque_date')->nullable();
            $table->decimal('amount', 20, 4)->nullable();
            $table->string('payee')->nullable();
            $table->string('memo')->nullable();
            $table->date('presented_date')->nullable();
            $table->date('cleared_date')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['cheque_book_id', 'cheque_no']);
        });

        Schema::create('cheque_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cheque_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_day_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['ISSUE', 'DEPOSIT', 'PRESENT', 'CLEAR', 'BOUNCE', 'STOP', 'CANCEL', 'RETURN']);
            $table->decimal('amount', 20, 4)->nullable();
            $table->dateTime('transaction_date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['cheque_id', 'transaction_date']);
        });

        Schema::create('cheque_clearings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cheque_id')->constrained()->restrictOnDelete();
            $table->foreignId('branch_day_id')->constrained()->restrictOnDelete();
            $table->string('clearing_no', 100);
            $table->string('drawer_bank_name', 150)->nullable();
            $table->string('drawer_bank_branch', 150)->nullable();
            $table->string('drawer_account_no', 100)->nullable();
            $table->decimal('amount', 20, 4);
            $table->date('clearing_date');
            $table->enum('status', ['RECEIVED', 'SENT', 'PRESENTED', 'CLEARED', 'RETURNED', 'CANCELLED'])->default('RECEIVED');
            $table->string('return_reason')->nullable();
            $table->date('cleared_date')->nullable();
            $table->timestamps();
            $table->unique(['branch_day_id', 'clearing_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheque_clearings');
        Schema::dropIfExists('cheque_transactions');
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('cheque_books');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('banks');
    }
};
