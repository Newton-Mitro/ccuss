<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('(FY-2025-26)');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
        });

        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->id();
            $table->string('period_name')->comment('(JAN-2026)');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['open', 'closed', 'locked'])->default('open');
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('fiscal_year_id')->constrained()->cascadeOnDelete();
        });

        Schema::create('closing_entries', function (Blueprint $table) {
            $table->id();
            $table->timestamp('closed_at');
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
            $table->foreignId('fiscal_period_id')->constrained();
        });

        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Unique GL code');
            $table->string('name', 100)->comment('Account name');
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->string('description')->nullable();
            $table->boolean('is_control_account')->default(false);
            $table->boolean('requires_subledger')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_leaf')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
            $table->foreignId('parent_id')->nullable()->constrained('ledger_accounts')->nullOnDelete();
        });

        Schema::create('ledger_account_balances', function (Blueprint $table) {
            $table->id();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('debit_total', 18, 2)->default(0);
            $table->decimal('credit_total', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('organization_id')->constrained();
            $table->foreignId('ledger_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_period_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_account_balances');
        Schema::dropIfExists('ledger_accounts');
        Schema::dropIfExists('closing_entries');
        Schema::dropIfExists('fiscal_periods');
        Schema::dropIfExists('fiscal_years');
    }
};