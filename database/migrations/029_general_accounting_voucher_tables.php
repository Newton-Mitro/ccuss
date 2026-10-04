<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fiscal_year_id')->constrained()->restrictOnDelete();
            $table->foreignId('fiscal_period_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->unique()
                ->constrained('financial_transactions')
                ->nullOnDelete();
            $table->string('voucher_no', 100);
            $table->enum('voucher_type', [
                'JOURNAL',
                'PAYMENT',
                'RECEIPT',
                'CONTRA',
                'OPENING',
                'ADJUSTMENT',
                'CLOSING',
                'SYSTEM',
            ]);
            $table->date('voucher_date');
            $table->text('description')->nullable();
            $table->enum('status', ['DRAFT', 'POSTED', 'REVERSED', 'CANCELLED'])->default('DRAFT');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'voucher_no']);
            $table->index(['organization_id', 'voucher_date']);
            $table->index(['organization_id', 'voucher_type']);
            $table->index(['organization_id', 'status']);
        });

        Schema::create('voucher_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('voucher_id')->constrained('vouchers')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cost_center_id')->nullable()->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('party_id')->nullable()->constrained('parties')->nullOnDelete();
            $table->string('description')->nullable();
            $table->decimal('debit', 20, 4)->default(0);
            $table->decimal('credit', 20, 4)->default(0);
            $table->string('reference', 150)->nullable();
            $table->unsignedInteger('line_no')->default(1);
            $table->timestamps();
            $table->index(['voucher_id', 'line_no']);
            $table->index(['account_id', 'voucher_id']);
            $table->index(['branch_id', 'account_id']);
            $table->index(['cost_center_id', 'account_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_entries');
        Schema::dropIfExists('vouchers');
    }
};