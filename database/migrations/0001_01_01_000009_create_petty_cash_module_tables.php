<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // Petty cash fund
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Office Petty Cash
            $table->string('code')->unique();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('custodian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('imprest_amount', 15, 2)->default(0); // fixed fund
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Expense categories
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Vouchers
        Schema::create('petty_cash_vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('voucher_no')->unique();
            $table->foreignId('petty_cash_account_id')->constrained()->cascadeOnDelete();
            $table->date('voucher_date');
            $table->decimal('total_amount', 15, 2);
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // Voucher line items
        Schema::create('petty_cash_voucher_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_voucher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expense_category_id')->constrained();
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->string('receipt_no')->nullable();
            $table->timestamps();
        });

        // Replenishments (top-ups)
        Schema::create('petty_cash_replenishments', function (Blueprint $table) {
            $table->id();
            $table->string('replenish_no')->unique();
            $table->foreignId('petty_cash_account_id')->constrained()->cascadeOnDelete();
            $table->string('source_account'); // free-text instead of ledger_id
            $table->decimal('amount', 15, 2);
            $table->date('replenish_date');
            $table->text('remarks')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Transaction log for petty cash
        Schema::create('petty_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_account_id')->constrained()->cascadeOnDelete();
            $table->string('reference_type'); // voucher | replenish | adjustment
            $table->unsignedBigInteger('reference_id');
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->date('transaction_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petty_cash_transactions');
        Schema::dropIfExists('petty_cash_replenishments');
        Schema::dropIfExists('petty_cash_voucher_items');
        Schema::dropIfExists('petty_cash_vouchers');
        Schema::dropIfExists('expense_categories');
        Schema::dropIfExists('petty_cash_accounts');
    }
};