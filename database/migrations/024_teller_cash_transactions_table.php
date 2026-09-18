<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('teller_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_location_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->constrained()->restrictOnDelete();
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
            $table->index(['teller_session_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teller_cash_transactions');
    }
};
