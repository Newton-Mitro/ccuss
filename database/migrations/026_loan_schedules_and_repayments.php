<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loan_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('installment_no');
            $table->date('due_date');
            $table->decimal('opening_principal', 20, 4);
            $table->decimal('scheduled_principal', 20, 4)->default(0);
            $table->decimal('scheduled_interest', 20, 4)->default(0);
            $table->decimal('scheduled_fee', 20, 4)->default(0);
            $table->decimal('scheduled_protection_fee', 20, 4)->default(0);
            $table->decimal('total_due', 20, 4)->default(0);
            $table->decimal('total_paid', 20, 4)->default(0);
            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'])->default('PENDING');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->unique(['loan_account_id', 'installment_no'], 'loan_schedule_number_unique');
            $table->index(['loan_account_id', 'due_date', 'status']);
        });

        Schema::create('loan_schedule_components', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_schedule_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['PRINCIPAL', 'INTEREST', 'FEE', 'PROTECTION_FEE']);
            $table->decimal('amount_due', 20, 4);
            $table->decimal('amount_paid', 20, 4)->default(0);
            $table->enum('status', ['PENDING', 'PARTIAL', 'PAID', 'WAIVED'])->default('PENDING');
            $table->timestamps();
            $table->unique(['loan_schedule_id', 'type'], 'loan_schedule_component_type_unique');
        });

        Schema::create('loan_repayments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->decimal('amount', 20, 4);
            $table->date('repayment_date');
            $table->enum('status', ['PENDING', 'POSTED', 'REVERSED', 'CANCELLED'])->default('PENDING');
            $table->string('reference', 100)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['loan_account_id', 'financial_transaction_id'], 'loan_repayment_transaction_unique');
            $table->index(['loan_account_id', 'repayment_date', 'status']);
        });

        Schema::create('loan_repayment_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_repayment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_schedule_id')->constrained()->restrictOnDelete();
            $table->foreignId('loan_schedule_component_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 20, 4);
            $table->timestamps();
            $table->unique(
                ['loan_repayment_id', 'loan_schedule_component_id'],
                'loan_repayment_component_unique',
            );
            $table->index(
                ['loan_schedule_id', 'loan_schedule_component_id'],
                'loan_allocation_schedule_component_index',
            );
        });

        Schema::create('loan_arrears', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('loan_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('loan_schedule_id')->constrained()->cascadeOnDelete();
            $table->date('as_of_date');
            $table->unsignedInteger('days_overdue')->default(0);
            $table->decimal('principal_overdue', 20, 4)->default(0);
            $table->decimal('interest_overdue', 20, 4)->default(0);
            $table->decimal('fee_overdue', 20, 4)->default(0);
            $table->decimal('total_overdue', 20, 4)->default(0);
            $table->enum('status', ['OPEN', 'PARTIALLY_CLEARED', 'CLEARED'])->default('OPEN');
            $table->timestamps();
            $table->unique(['loan_schedule_id', 'as_of_date'], 'loan_arrear_schedule_date_unique');
            $table->index(['loan_account_id', 'status', 'as_of_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_arrears');
        Schema::dropIfExists('loan_repayment_allocations');
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('loan_schedule_components');
        Schema::dropIfExists('loan_schedules');
    }
};
