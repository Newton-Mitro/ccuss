<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('cheque_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('book_no')->unique();
            $table->integer('start_number');
            $table->integer('end_number');
            $table->date('issued_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_book_id')->nullable()->constrained()->nullOnDelete();
            // issuer (internal account)
            $table->foreignId('issuer_account_id')->nullable()->constrained('accounts')->nullOnDelete();

            $table->string('issuer_bank_name')->nullable();
            $table->string('issuer_branch')->nullable();

            $table->string('cheque_number');
            $table->date('cheque_date')->nullable();
            $table->decimal('amount', 18, 2);
            $table->string('payee_name')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['issued', 'presented', 'cleared', 'bounced', 'cancelled'])->default('issued');
            $table->boolean('stop_payment')->default(false);
            $table->timestamp('cleared_at')->nullable();
            $table->timestamp('bounced_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cheque_deposits', function (Blueprint $table) {
            $table->id();
            // where money goes (must be accounts table)
            $table->foreignId('deposit_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('cheque_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->date('deposit_date');
            $table->enum('status', ['pending', 'sent_to_clearing', 'cleared', 'rejected'])->default('pending');
            $table->timestamps();
        });

        Schema::create('clearing_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number')->unique();
            $table->date('clearing_date');
            $table->enum('status', ['pending', 'sent', 'settled', 'failed'])->default('pending');
            $table->timestamps();
        });

        Schema::create('clearing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clearing_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cheque_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['sent', 'cleared', 'bounced'])->default('sent');
            $table->string('return_reason')->nullable();
            $table->timestamps();
            $table->unique(['clearing_batch_id', 'cheque_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheque_books');
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('clearing_batches');
        Schema::dropIfExists('clearing_items');
    }
};