<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('deposit_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('financial_product_id')->constrained('financial_products')->restrictOnDelete();
            $table->enum('account_kind', ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT']);
            $table->enum('status', ['PENDING', 'ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED', 'MATURED'])->default('PENDING');
            $table->date('opened_at')->nullable();
            $table->date('closed_at')->nullable();
            $table->date('last_operated_at')->nullable();
            $table->date('membership_eligible_at')->nullable();
            $table->text('closure_reason')->nullable();
            $table->timestamps();
            $table->index(['customer_id', 'account_kind', 'status']);
            $table->index(['financial_product_id', 'status']);
        });

        Schema::create('deposit_account_holders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->enum('role', ['PRIMARY', 'JOINT'])->default('JOINT');
            $table->decimal('ownership_percent', 8, 4)->default(100);
            $table->foreignId('guardian_customer_id')->nullable()->constrained('customers')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['deposit_account_id', 'customer_id'], 'deposit_account_holder_unique');
            $table->index(['customer_id', 'role']);
        });

        Schema::create('share_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('deposit_account_id')->unique()->constrained('deposit_accounts')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->date('member_since')->nullable();
            $table->string('membership_no', 100)->nullable();
            $table->enum('membership_status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])->default('PENDING');
            $table->timestamps();
            $table->unique(['customer_id', 'membership_no']);
            $table->index(['customer_id', 'membership_status']);
        });

        Schema::create('deposit_nominees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('deposit_account_id')->constrained('deposit_accounts')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('relationship', 100);
            $table->string('phone', 50)->nullable();
            $table->string('identification_type', 100)->nullable();
            $table->string('identification_number', 100)->nullable();
            $table->decimal('share_percent', 8, 4)->default(100);
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
            $table->index(['deposit_account_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_nominees');
        Schema::dropIfExists('share_accounts');
        Schema::dropIfExists('deposit_account_holders');
        Schema::dropIfExists('deposit_accounts');
    }
};
