<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('saving_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('minimum_balance', 20, 4)->default(0);
            $table->decimal('current_balance', 20, 4)->default(0);
            $table->timestamps();
        });

        Schema::create('share_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->unique()->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->date('member_since')->nullable();
            $table->string('membership_no', 100)->nullable();
            $table->enum('membership_status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'])->default('PENDING');
            $table->timestamps();
            $table->unique(['customer_id', 'membership_no']);
            $table->index(['customer_id', 'membership_status']);
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('share_accounts');
    }
};
