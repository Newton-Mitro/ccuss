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

        Schema::table('financial_product_account_mappings', function (Blueprint $table): void {
            $table->foreign('debit_account_id')
                ->references('id')
                ->on('accounts')
                ->nullOnDelete();
            $table->foreign('credit_account_id')
                ->references('id')
                ->on('accounts')
                ->nullOnDelete();
        });

        Schema::table('petty_cash_transactions', function (Blueprint $table): void {
            $table->foreign('expense_account_id')
                ->references('id')
                ->on('accounts')
                ->nullOnDelete();
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
        | Vouchers
        |--------------------------------------------------------------------------
        |
        | Voucher header.
        |
        | A voucher contains one or more voucher entries.
        |
        */

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

            /*
             * Optional reference to a financial transaction
             * generated by another subsystem.
             */
            $table->foreignId('financial_transaction_id')
                ->nullable()
                ->unique()
                ->constrained('financial_transactions')
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

            $table->text('description')
                ->nullable();

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

            $table->timestamp('posted_at')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'organization_id',
                'voucher_no',
            ]);

            $table->index([
                'organization_id',
                'voucher_date',
            ]);

            $table->index([
                'organization_id',
                'voucher_type',
            ]);

            $table->index([
                'organization_id',
                'status',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Voucher Entries
        |--------------------------------------------------------------------------
        |
        | Debit / Credit lines belonging to a voucher.
        |
        | Every POSTED voucher must satisfy:
        |
        | Total Debit = Total Credit
        |
        */

        Schema::create('voucher_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('voucher_id')
                ->constrained('vouchers')
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
                ->constrained('cost_centers')
                ->nullOnDelete();

            /*
             * Links the entry to a financial/sub-ledger account.
             *
             * Examples:
             * - Bank Account
             * - Savings Account
             * - Loan Account
             * - Fixed Deposit Account
             */
            $table->foreignId('financial_account_id')
                ->nullable()
                ->constrained('financial_accounts')
                ->nullOnDelete();

            $table->string('description')
                ->nullable();

            $table->decimal('debit', 20, 4)
                ->default(0);

            $table->decimal('credit', 20, 4)
                ->default(0);

            $table->string('reference', 150)
                ->nullable();

            $table->unsignedInteger('line_no')
                ->default(1);

            $table->timestamps();

            $table->index([
                'voucher_id',
                'line_no',
            ]);

            $table->index([
                'account_id',
                'voucher_id',
            ]);

            $table->index([
                'branch_id',
                'account_id',
            ]);

            $table->index([
                'cost_center_id',
                'account_id',
            ]);

            $table->index([
                'financial_account_id',
            ]);
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
        /*
        |--------------------------------------------------------------------------
        | Drop in reverse dependency order
        |--------------------------------------------------------------------------
        */

        Schema::dropIfExists('budget_entries');

        Schema::dropIfExists('budgets');

        Schema::dropIfExists('voucher_entries');

        Schema::dropIfExists('vouchers');

        Schema::dropIfExists('cost_centers');

        Schema::dropIfExists('accounts');

        Schema::dropIfExists('account_groups');
    }
};
