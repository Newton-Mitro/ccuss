<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['Deposit', 'Loan', 'Share']);
            $table->string('subtype'); // Deposit- (Savings, Reccurring, Fixed), Loan- (Member/Personal Loan, SME, Education, Housing), Share- (Share Capital), Cash- (Drawer Cash, Vault Cash, Bank Cash, Petty Cash)
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->integer('term_months')->nullable();
            $table->boolean('is_active')->default(true);

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_no', 50)->unique();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('account_type', ['CUSTOMER', 'CASH', 'PETTY_CASH', 'GL']);
            $table->decimal('balance', 18, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'CLOSED', 'FROZEN'])->default('ACTIVE');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });


        Schema::create('account_holders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained();
            $table->string('holder_type')->default('PRIMARY');
            // PRIMARY, JOINT, AUTHORIZED
            $table->decimal('ownership_percent', 5, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('deposit_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['account_id', 'accrual_date']); // prevent duplicate accrual
        });

        Schema::create('loan_interest_accruals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->date('accrual_date');
            $table->decimal('accrued_interest', 18, 2);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->timestamps();
            $table->unique(['account_id', 'accrual_date']);
        });

        Schema::create('loan_penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->date('penalty_date');
            $table->decimal('penalty_amount', 18, 2);
            $table->enum('penalty_type', ['LATE_PAYMENT', 'PREMATURE_WITHDRAWAL', 'OVERDUE', 'OTHER']);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete()->comment('Linked transaction when posted');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['account_id', 'penalty_date', 'penalty_type']);
        });


        Schema::create('transaction_types', function (Blueprint $table) {
            $table->id();
            $table->string('type_code', 50)->unique();
            $table->string('type_name', 100)->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no', 50)->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete(); // primary account holder
            $table->foreignId('transaction_type_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('transaction_date')->useCurrent();
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('channel')->nullable(); // teller, mobile, atm, online
            $table->string('reference', 150)->nullable();

            $table->foreignId('created_by')->constrained('users');
            $table->enum('status', ['PENDING', 'APPROVED', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('transaction_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->decimal('amount', 18, 2);
            // optional subledger reference
            $table->nullableMorphs('subledger');
            $table->string('component')->nullable(); // 'INTEREST', 'PENALTY' ,'CASH_IN', 'PRINCIPAL'
            $table->string(column: 'description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('transaction_types');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('transaction_lines');
    }
};
