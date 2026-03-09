<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // ---------------------------
        // Tellers
        // ---------------------------
        Schema::create('tellers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ---------------------------
        // Vaults
        // ---------------------------
        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g., Main Vault, ATM Vault
            $table->decimal('total_balance', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ---------------------------
        // Vault Denominations
        // ---------------------------
        Schema::create('vault_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete();
            $table->integer('denomination'); // e.g., 100, 50, 20
            $table->integer('count')->default(0);
            $table->decimal('total', 18, 2)->virtualAs('denomination * count'); // optional calculated column
            $table->timestamps();
        });

        // ---------------------------
        // Cash Drawers (Teller's Cash)
        // ---------------------------
        Schema::create('cash_drawers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vault_id')->constrained()->cascadeOnDelete(); // Drawer linked to vault
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->date('business_date');
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->timestamps();
        });

        // ---------------------------
        // Cash Transactions (Cash In/Out)
        // ---------------------------
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_drawer_id')->constrained()->cascadeOnDelete();
            // $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete(); // links to voucher
            $table->decimal('amount', 18, 2);
            $table->enum('type', ['CASH_IN', 'CASH_OUT']); // Cash in or out of drawer
            $table->string('source_type')->nullable(); // e.g., 'deposit', 'withdrawal', 'loan_repayment'
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('reference')->nullable();
            $table->timestamp('transaction_date');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // ---------------------------
        // Cash Balancing
        // ---------------------------
        Schema::create('cash_balancing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_drawer_id')->constrained()->cascadeOnDelete();
            $table->decimal('expected_balance', 18, 2);
            $table->decimal('actual_balance', 18, 2);
            $table->decimal('difference', 18, 2);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('balanced_at');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_balancing');
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('cash_drawers');
        Schema::dropIfExists('vault_denominations');
        Schema::dropIfExists('vaults');
        Schema::dropIfExists('tellers');
    }
};
