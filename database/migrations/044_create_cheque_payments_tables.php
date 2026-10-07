<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cheque_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->foreignId('cheque_id')->constrained()->restrictOnDelete();
            $table->foreignId('teller_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('signatory_customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('status', 30)->default('RECEIVED');
            $table->decimal('amount', 20, 4);
            $table->json('checks')->nullable();
            $table->text('note')->nullable();
            $table->text('return_reason')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'status']);
            $table->index(['branch_id', 'status']);
        });

        Schema::create('cheque_payment_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cheque_payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 30);
            $table->json('metadata')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->index(['cheque_payment_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheque_payment_events');
        Schema::dropIfExists('cheque_payments');
    }
};