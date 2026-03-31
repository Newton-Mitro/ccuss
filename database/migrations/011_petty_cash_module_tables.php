<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // Petty Cash Accounts (Sub Ledgers)
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Office Petty Cash
            $table->string('code')->unique();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('custodian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('imprest_amount', 15, 2)->default(0); // fixed fund
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Employee Advance Petty Cash Accounts (Sub Ledgers)
        Schema::create('employee_advances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('petty_cash_transaction_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2); // total advance
            $table->decimal('settled_amount', 15, 2)->default(0);
            $table->date('given_at');
            $table->string('status')->default('open');
            // open, partial, settled
            $table->timestamps();
        });

        // Petty Cash Transaction Types
        Schema::create('petty_cash_transaction_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->timestamps();
        });

        // Petty Cash Transactions (Ledgers)
        Schema::create('petty_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('petty_cash_transaction_type_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petty_cash_accounts');
    }
};