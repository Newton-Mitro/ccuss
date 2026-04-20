<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('link_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('name');
            $table->decimal('upper_limit', 18, 2)->default(0);
            $table->foreignId('ledger_account_id')->constrained();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('petty_cash_advance_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('link_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('employee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ledger_account_id')->constrained();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_petty_cash_accounts');
        Schema::dropIfExists('petty_cash_accounts');
    }
};