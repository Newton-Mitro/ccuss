<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // -----------------------
        // Transaction Batches
        // -----------------------
        Schema::create('transaction_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('branch_id')->constrained();
            $table->string('batch_reference')->unique();
            $table->enum('type', ['loan_repayment', 'deposit', 'transfer', 'mixed', 'expense', 'other']);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // -----------------------
        // Transactions Table (with morph)
        // -----------------------
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('branch_id')->constrained();
            $table->foreignId('transaction_batch_id')->nullable()->constrained('transaction_batches')->cascadeOnDelete();

            // Polymorphic relation to any module (loan, deposit, cash, vendor, etc.)
            $table->morphs('transactionable'); // creates `transactionable_id` + `transactionable_type`

            $table->enum('transaction_type', ['credit', 'debit']);
            $table->decimal('amount', 18, 2);

            // Accounts involved in double-entry
            $table->foreignId('account_from')->nullable()->constrained('cash_accounts'); // can morph to other account tables if needed
            $table->foreignId('account_to')->nullable()->constrained('cash_accounts');

            $table->string('description')->nullable();
            $table->dateTime('transaction_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();
        });

    }


    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('transaction_batches');
    }
};