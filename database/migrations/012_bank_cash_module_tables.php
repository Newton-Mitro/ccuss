<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // ------------------------
        // 1. Bank Accounts
        // ------------------------
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('bank_name');
            $table->string('branch_name')->nullable();
            $table->string('account_number')->unique();
            $table->string('swift_code')->nullable();
            $table->string('routing_number')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ------------------------
        // 2. Bank Reconciliations
        // ------------------------
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->date('reconcile_date');
            $table->decimal('statement_balance', 18, 2);
            $table->decimal('system_balance', 18, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['bank_account_id', 'reconcile_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_accounts');
    }
};