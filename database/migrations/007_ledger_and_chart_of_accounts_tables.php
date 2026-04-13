<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('closing_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('fiscal_period_id')->constrained();
            $table->timestamp('closed_at');
        });

        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->string('code', 50)->unique()->comment('Unique GL code');
            $table->string('name', 100)->comment('Account name');
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->string('description')->nullable();
            $table->boolean('is_control_account')->default(false);
            $table->boolean('requires_subledger')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_leaf')->default(true);
            $table->foreignId('parent_id')->nullable()->constrained('ledger_accounts')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ledger_account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('ledger_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_period_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('debit_total', 18, 2)->default(0);
            $table->decimal('credit_total', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_account_balances');
        Schema::dropIfExists('ledger_accounts');
        Schema::dropIfExists('closing_entries');
    }
};