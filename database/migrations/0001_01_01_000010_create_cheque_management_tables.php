<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('cheque_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();
            $table->string('book_no');
            $table->integer('start_number');
            $table->integer('end_number');
            $table->date('issued_at')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['deposit_account_id', 'book_no']);
        });

        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_book_id')->constrained()->cascadeOnDelete();
            $table->string('cheque_number');
            $table->date('cheque_date')->nullable();
            $table->decimal('amount', 18, 2); // required
            $table->string('payee_name')->nullable(); // can leave blank if cash
            $table->text('remarks')->nullable();
            $table->enum('status', [
                'UNUSED',       // not issued yet
                'ISSUED',       // handed to customer
                'PRESENTED',    // presented for withdrawal
                'CLEARED',      // credit union paid cash
                'BOUNCED',      // insufficient balance
                'CANCELLED'     // stop payment
            ])->default('UNUSED');
            $table->foreignId('deposit_transaction_id')->nullable()->constrained('deposit_transactions')->nullOnDelete();
            $table->timestamps();

            $table->unique(['cheque_book_id', 'cheque_number']);
        });

        Schema::create('cheque_stop_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cheque_id')->constrained()->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheque_stop_payments');
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('cheque_books');
    }
};