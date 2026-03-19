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
        Schema::create('transaction_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('branch_id')->constrained();
            $table->foreignId('transaction_batch_id')->nullable()->constrained('transaction_batches')->cascadeOnDelete();

            // Polymorphic relation to any module (loan, deposit, cash, vendor, etc.)
            $table->morphs('transactionable'); // creates `transactionable_id` + `transactionable_type`

            $table->decimal('debit', 18, 2)->default(0);
            $table->decimal('credit', 18, 2)->default(0);

            $table->string('description')->nullable();
            $table->dateTime('transaction_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();
        });

    }


    public function down(): void
    {
        Schema::dropIfExists('transaction_lines');
        Schema::dropIfExists('transaction_batches');
    }
};