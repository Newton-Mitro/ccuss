<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            $table->unique([
                'organization_id',
                'name',
            ]);

            $table->index([
                'organization_id',
                'start_date',
                'end_date',
            ]);
        });

        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->timestamps();

            $table->unique([
                'fiscal_year_id',
                'name',
            ]);

            $table->index([
                'fiscal_year_id',
                'start_date',
                'end_date',
            ]);
        });

        Schema::create('account_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('account_groups')->nullOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);
            $table->enum('normal_balance', ['DEBIT', 'CREDIT']);
            $table->unsignedInteger('level')->default(0);
            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->unique([
                'organization_id',
                'code',
            ]);

            $table->index([
                'organization_id',
                'parent_id',
            ]);
        });

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_group_id')->constrained('account_groups')->restrictOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->enum('type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);
            $table->enum('normal_balance', ['DEBIT', 'CREDIT']);

            $table->unsignedInteger('level')->default(0);

            /*
             * Control account means this account can represent
             * a sub-ledger such as Receivables, Payables, etc.
             */
            $table->boolean('is_control_account')->default(false);

            /*
             * Useful for bank reconciliation, etc.
             */
            $table->boolean('is_reconcilable')->default(false);

            $table->boolean('is_system')->default(false);
            $table->boolean('status')->default(true);

            $table->timestamps();

            $table->unique([
                'organization_id',
                'code',
            ]);

            $table->index([
                'organization_id',
                'account_group_id',
            ]);

            $table->index([
                'organization_id',
                'parent_id',
            ]);
        });

        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('fiscal_year_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('fiscal_period_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->unique()
                ->constrained()
                ->nullOnDelete();

            $table->string('voucher_no', 100);

            $table->enum('voucher_type', [
                'JOURNAL',
                'PAYMENT',
                'RECEIPT',
                'CONTRA',
                'OPENING',
                'ADJUSTMENT',
                'CLOSING',
                'SYSTEM',
            ]);

            $table->date('voucher_date');

            $table->text('description')->nullable();

            $table->enum('status', [
                'DRAFT',
                'POSTED',
                'REVERSED',
                'CANCELLED',
            ])->default('DRAFT');

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('posted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('posted_at')->nullable();

            $table->timestamps();

            $table->unique([
                'organization_id',
                'voucher_no',
            ]);

            $table->index([
                'organization_id',
                'voucher_date',
            ]);
        });

        Schema::create('voucher_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('voucher_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('account_id')
                ->constrained('accounts')
                ->restrictOnDelete();

            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('cost_center_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->nullableMorphs('party');

            $table->string('description')->nullable();

            $table->decimal('debit', 20, 4)->default(0);
            $table->decimal('credit', 20, 4)->default(0);

            $table->string('reference')->nullable();

            $table->unsignedInteger('line_no')->default(1);

            $table->timestamps();

            $table->index([
                'account_id',
                'voucher_id',
            ]);

            $table->index([
                'branch_id',
                'account_id',
            ]);
        });

        Schema::create('cost_centers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('cost_centers')
                ->nullOnDelete();

            $table->string('code', 50);
            $table->string('name', 150);

            $table->unsignedInteger('level')->default(0);

            $table->boolean('status')->default(true);

            $table->timestamps();

            $table->unique([
                'organization_id',
                'code',
            ]);
        });

        Schema::create('budgets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('fiscal_year_id')
                ->constrained()
                ->restrictOnDelete();

            $table->string('name', 150);

            $table->enum('status', [
                'DRAFT',
                'ACTIVE',
                'CLOSED',
            ])->default('DRAFT');

            $table->timestamps();

            $table->index([
                'organization_id',
                'fiscal_year_id',
            ]);
        });

        Schema::create('budget_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('account_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('cost_center_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('fiscal_period_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->decimal('amount', 20, 4)->default(0);

            $table->timestamps();

            $table->index([
                'budget_id',
                'account_id',
            ]);
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('budget_entries');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('cost_centers');
        Schema::dropIfExists('voucher_entries');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('account_groups');
        Schema::dropIfExists('fiscal_periods');
        Schema::dropIfExists('fiscal_years');
    }
};