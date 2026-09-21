<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('interest_provisions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('financial_product_id')->constrained('financial_products')->restrictOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->date('calculated_at');
            $table->decimal('basis_amount', 20, 4);
            $table->decimal('annual_rate', 12, 6);
            $table->decimal('provisioned_amount', 20, 4);
            $table->enum('status', ['CALCULATED', 'APPROVED', 'POSTED', 'REVERSED'])->default('CALCULATED');
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->foreignId('calculated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['financial_account_id', 'period_start', 'period_end'], 'interest_provision_period_unique');
            $table->index(['status', 'period_end']);
        });

        Schema::create('interest_postings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('interest_provision_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_transaction_id')->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->decimal('amount', 20, 4);
            $table->date('posted_at');
            $table->enum('status', ['POSTED', 'REVERSED'])->default('POSTED');
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('share_dividend_declarations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_year_id')->constrained('fiscal_years')->restrictOnDelete();
            $table->string('declaration_no', 100);
            $table->date('declaration_date');
            $table->decimal('dividend_rate', 12, 6);
            $table->decimal('total_basis_amount', 20, 4)->default(0);
            $table->decimal('total_dividend_amount', 20, 4)->default(0);
            $table->enum('status', ['DRAFT', 'APPROVED', 'POSTED', 'CANCELLED'])->default('DRAFT');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'declaration_no'], 'dividend_declaration_number_unique');
            $table->unique(['organization_id', 'fiscal_year_id'], 'dividend_declaration_year_unique');
            $table->index(['organization_id', 'status']);
        });

        Schema::create('share_dividend_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('share_dividend_declaration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('share_account_id')->constrained('share_accounts')->restrictOnDelete();
            $table->decimal('basis_amount', 20, 4);
            $table->decimal('dividend_rate', 12, 6);
            $table->decimal('dividend_amount', 20, 4);
            $table->enum('status', ['CALCULATED', 'POSTED', 'REVERSED'])->default('CALCULATED');
            $table->foreignId('financial_transaction_id')->nullable()->constrained('financial_transactions')->nullOnDelete();
            $table->timestamps();
            $table->unique(['share_dividend_declaration_id', 'share_account_id'], 'share_dividend_account_unique');
            $table->index(['share_account_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('share_dividend_allocations');
        Schema::dropIfExists('share_dividend_declarations');
        Schema::dropIfExists('interest_postings');
        Schema::dropIfExists('interest_provisions');
    }
};
