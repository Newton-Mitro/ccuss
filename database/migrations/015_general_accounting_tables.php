<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Account Groups
        |--------------------------------------------------------------------------
        |
        | Hierarchical classification of accounts.
        |
        | Assets
        | ├── Current Assets
        | ├── Fixed Assets
        | └── Other Assets
        |
        | Liabilities
        | ├── Current Liabilities
        | └── Long-term Liabilities
        |
        | Equity
        | Income
        | Expense
        |
        */

        Schema::create('account_groups', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('account_groups')
                ->nullOnDelete();

            $table->string('code', 50);
            $table->string('name', 150);

            $table->enum('type', [
                'ASSET',
                'LIABILITY',
                'EQUITY',
                'INCOME',
                'EXPENSE',
            ]);

            $table->enum('normal_balance', [
                'DEBIT',
                'CREDIT',
            ]);

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

            $table->index([
                'organization_id',
                'type',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Accounts / Chart of Accounts
        |--------------------------------------------------------------------------
        |
        | Actual ledger accounts belonging to account groups.
        |
        | Example:
        |
        | 1000 Assets
        |   1100 Current Assets
        |      1110 Cash
        |      1120 Bank
        |      1130 Member Receivables
        |
        */

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('account_group_id')
                ->constrained('account_groups')
                ->restrictOnDelete();

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('accounts')
                ->nullOnDelete();

            $table->string('code', 50);
            $table->string('name', 150);

            $table->enum('type', [
                'ASSET',
                'LIABILITY',
                'EQUITY',
                'INCOME',
                'EXPENSE',
            ]);

            $table->enum('normal_balance', [
                'DEBIT',
                'CREDIT',
            ]);

            $table->unsignedInteger('level')->default(0);

            /*
             * Control accounts connect the General Ledger
             * with subsidiary ledgers.
             *
             * Examples:
             * - Member Receivables
             * - Loan Receivables
             * - Savings Deposits
             * - Accounts Payable
             */
            $table->boolean('is_control_account')
                ->default(false);

            /*
             * Used for bank/account reconciliation.
             */
            $table->boolean('is_reconcilable')
                ->default(false);

            /*
             * Identifies physical cash accounts.
             *
             * Examples:
             * - Branch Cash
             * - Teller Cash
             * - Vault Cash
             * - Petty Cash
             */
            $table->boolean('is_cash_account')
                ->default(false);

            $table->boolean('is_system')
                ->default(false);

            $table->boolean('status')
                ->default(true);

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

            $table->index([
                'organization_id',
                'type',
            ]);

            $table->index([
                'organization_id',
                'is_cash_account',
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | Cost Centers
        |--------------------------------------------------------------------------
        |
        | Used for departmental, branch and operational analysis.
        |
        | Example:
        |
        | Head Office
        | ├── HR
        | ├── Finance
        | └── IT
        |
        | Branch 01
        | ├── Teller
        | ├── Loan
        | └── Deposit
        |
        */

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

            $table->unsignedInteger('level')
                ->default(0);

            $table->boolean('status')
                ->default(true);

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


        /*
        |--------------------------------------------------------------------------
        | Accounting Parties
        |--------------------------------------------------------------------------
        |
        | Organization-scoped counterparties referenced by voucher entries.
        |
        */

        Schema::create('parties', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('party_type', 30)->default('OTHER');
            $table->string('phone', 50)->nullable();
            $table->string('email', 254)->nullable();
            $table->string('address', 500)->nullable();
            $table->boolean('status')->default(true);

            $table->timestamps();

            $table->unique(['organization_id', 'code']);
            $table->index(['organization_id', 'party_type', 'status']);
        });


        /*
        |--------------------------------------------------------------------------
        | Budgets
        |--------------------------------------------------------------------------
        |
        | Budget header for a financial year.
        |
        */

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

            $table->unique([
                'organization_id',
                'fiscal_year_id',
                'name',
            ]);

            $table->index([
                'organization_id',
                'fiscal_year_id',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Budget Entries
        |--------------------------------------------------------------------------
        |
        | Account-level budget allocation.
        |
        */

        Schema::create('budget_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('budget_id')
                ->constrained('budgets')
                ->cascadeOnDelete();

            $table->foreignId('account_id')
                ->constrained('accounts')
                ->restrictOnDelete();

            $table->foreignId('cost_center_id')
                ->nullable()
                ->constrained('cost_centers')
                ->nullOnDelete();

            $table->foreignId('fiscal_period_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->decimal('amount', 20, 4)
                ->default(0);

            $table->timestamps();

            $table->index([
                'budget_id',
                'account_id',
            ]);

            $table->index([
                'fiscal_period_id',
                'account_id',
            ]);

            $table->index([
                'cost_center_id',
                'account_id',
            ]);
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('budget_entries');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('parties');
        Schema::dropIfExists('cost_centers');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('account_groups');
    }
};
