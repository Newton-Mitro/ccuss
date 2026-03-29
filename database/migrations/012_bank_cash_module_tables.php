<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // ------------------------
        // 1. Banks
        // ------------------------
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->string('swift_code')->nullable();
            $table->string('routing_number')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        // ------------------------
        // 2. Bank Branches
        // ------------------------
        Schema::create('bank_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('routing_number')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ------------------------
        // 3. Bank Accounts
        // ------------------------
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('account_name');
            $table->string('account_number')->unique();
            $table->string('iban')->nullable();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->string('currency', 10)->default('BDT');
            $table->enum('status', ['active', 'inactive', 'closed'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['bank_id', 'bank_branch_id']);
        });

        // ------------------------
        // 5. Bank Cheques
        // ------------------------
        Schema::create('bank_cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->string('cheque_no')->unique();
            $table->decimal('amount', 18, 2);
            $table->string('payee')->nullable();
            $table->date('cheque_date');
            $table->enum('status', ['issued', 'cleared', 'bounced', 'cancelled'])->default('issued');
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['bank_account_id', 'status', 'cheque_date']);
        });


        // ------------------------
        // 6. Bank Reconciliations
        // ------------------------
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->date('reconcile_date');
            $table->decimal('statement_balance', 18, 2);
            $table->decimal('system_balance', 18, 2);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['bank_account_id', 'reconcile_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_cheques');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('bank_branches');
        Schema::dropIfExists('banks');
    }
};