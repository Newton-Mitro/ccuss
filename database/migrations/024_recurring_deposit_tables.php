<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('recurring_deposits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('installment_amount', 20, 2);
            $table->enum('installment_frequency', ['WEEKLY', 'MONTHLY', 'QUARTERLY'])->default('MONTHLY');
            $table->unsignedInteger('total_installments');
            $table->unsignedInteger('paid_installments')->default(0);
            $table->date('started_at');
            $table->date('maturity_date');
            $table->unsignedInteger('grace_days')->default(0);
            $table->unsignedInteger('maturity_extension_days')->default(0);
            $table->decimal('contractual_rate', 12, 2)->nullable();
            $table->decimal('maturity_amount', 20, 2)->nullable();
            $table->date('closed_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->index('maturity_date');
            $table->index(['maturity_date', 'closed_at']);
            $table->index(['started_at', 'maturity_date']);
        });

        Schema::create('recurring_deposit_installments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('recurring_deposit_id')->constrained('recurring_deposits')->cascadeOnDelete();
            $table->unsignedInteger('installment_no');
            $table->date('due_date');
            $table->decimal('amount_due', 20, 2);
            $table->decimal('amount_paid', 20, 2)->default(0);
            $table->decimal('fine_amount', 20, 2)->default(0);
            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'MISSED', 'WAIVED'])->default('PENDING');
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->nullOnDelete();
            $table->timestamps();
            $table->unique(['recurring_deposit_id', 'installment_no'], 'rd_installment_number_unique');
            $table->index(['due_date', 'status']);
            $table->index(['recurring_deposit_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_deposit_installments');
        Schema::dropIfExists('recurring_deposits');
    }
};