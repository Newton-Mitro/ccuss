<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('bank_cheque_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('deposit_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('book_no');
            $table->integer('start_number');
            $table->integer('end_number');
            $table->date('issued_at')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['deposit_account_id', 'book_no']);
        });

        Schema::create('bank_cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_cheque_book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('deposit_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('cheque_number');
            $table->date('cheque_date')->nullable();
            $table->decimal('amount', 18, 2);
            $table->string('payee_name')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['issued', 'presented', 'cleared', 'bounced', 'cancelled'])->default('issued');
            $table->boolean('stop_payment')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('cheque_presentations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_cheque_id')->constrained()->cascadeOnDelete();
            $table->foreignId('voucher_entry_id')->nullable();
            $table->decimal('amount', 18, 2);
            $table->date('presented_at');
            $table->enum('status', ['pending', 'sent_for_clearing', 'cleared', 'bounced'])->default('pending');
            $table->string('return_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('clearing_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number')->unique();
            $table->date('clearing_date');
            $table->enum('status', ['pending', 'sent', 'settled', 'failed'])->default('pending');
            $table->timestamps();
        });

        Schema::create('cheque_stop_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_cheque_id')->constrained()->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamps();
        });

        // 🔄 Flow Mapping to Schema
        // 🧾 When cheque is presented:
        //     - Update cheques.status = presented
        //     - Insert into cheque_presentations
        // 💸 When approved:
        //     - Create transactions
        //     - Create transaction_entries (double entry)
        //     - Link transaction_id to presentation
        // 🏦 If interbank:
        //     - Assign clearing_batch_id
        //     - Update status → sent_for_clearing
        // ✅ On success:
        //     - Update:
        //         - cheques.status = cleared
        //         - cheque_presentations.status = cleared
        // ❌ On failure:
        //     - Reverse transaction (new transaction)
        //     - Mark:
        //         - status = returned
        //         - Add return_reason
    }

    public function down(): void
    {
        Schema::dropIfExists('cheque_stop_payments');
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('cheque_books');
    }
};