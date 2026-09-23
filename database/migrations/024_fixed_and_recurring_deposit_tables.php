<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fixed_deposits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('principal_amount', 20, 4);
            $table->decimal('contractual_rate', 12, 6);
            $table->unsignedInteger('term_months');
            $table->date('started_at');
            $table->date('maturity_date');
            $table->decimal('maturity_amount', 20, 4)->nullable();
            $table->enum('maturity_instruction', ['PAYOUT', 'RENEW_PRINCIPAL', 'RENEW_PRINCIPAL_AND_INTEREST'])->default('PAYOUT');
            $table->enum('status', ['ACTIVE', 'MATURED', 'RENEWED', 'PREMATURELY_CLOSED', 'CLOSED'])->default('ACTIVE');
            $table->date('closed_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->timestamps();
            $table->index(['maturity_date', 'status']);
        });

        Schema::create('recurring_deposits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('installment_amount', 20, 4);
            $table->enum('installment_frequency', ['WEEKLY', 'MONTHLY', 'QUARTERLY'])->default('MONTHLY');
            $table->unsignedInteger('total_installments');
            $table->unsignedInteger('paid_installments')->default(0);
            $table->date('started_at');
            $table->date('maturity_date');
            $table->unsignedInteger('maturity_extension_days')->default(0);
            $table->unsignedInteger('grace_days')->default(0);
            $table->enum('status', ['ACTIVE', 'MATURED', 'CLOSED', 'PREMATURELY_CLOSED'])->default('ACTIVE');
            $table->date('closed_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->timestamps();
            $table->index(['maturity_date', 'status']);
        });

        Schema::create('recurring_deposit_installments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('recurring_deposit_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('installment_no');
            $table->date('due_date');
            $table->decimal('amount_due', 20, 4);
            $table->decimal('amount_paid', 20, 4)->default(0);
            $table->decimal('fine_amount', 20, 4)->default(0);
            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'MISSED', 'WAIVED'])->default('PENDING');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->unique(
                ['recurring_deposit_id', 'installment_no'],
                'rd_installment_number_unique',
            );
            $table->index(['due_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_deposit_installments');
        Schema::dropIfExists('recurring_deposits');
        Schema::dropIfExists('fixed_deposits');
    }
};
