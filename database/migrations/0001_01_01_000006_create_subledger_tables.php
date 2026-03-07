<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->enum('type', ['Deposit', 'Loan', 'Share']);
            $table->string('subtype');
            $table->string('description')->nullable();

            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no', 50)->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_event_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('transaction_date')->useCurrent();
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('channel')->nullable();// teller, mobile, atm, online
            $table->string('reference', 150)->nullable();

            // link to accounting
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->enum('status', ['PENDING', 'APPROVED', 'POSTED', 'CANCELLED'])->default('PENDING');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('component')->nullable();// optional component (principal, interest, penalty)
            $table->decimal('amount', 18, 2);
            // optional subledger reference
            $table->nullableMorphs('subledger');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
