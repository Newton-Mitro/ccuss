<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        /*
       |--------------------------------------------------------------------------
       | Fiscal Years
       |--------------------------------------------------------------------------
       */
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->string('code')->unique()->comment('(FY-2025-26)');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Fiscal Periods
        |--------------------------------------------------------------------------
        */
        Schema::create('accounting_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('fiscal_year_id')->constrained()->cascadeOnDelete();
            $table->string('period_name')->comment('(JAN-2026)');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_open')->default(true);
            $table->timestamps();
        });

        Schema::create('closing_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('accounting_period_id')->constrained();
            $table->timestamp('closed_at');
        });

        /*
        |--------------------------------------------------------------------------
        | Ledger Accounts
        |--------------------------------------------------------------------------
        */
        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->string('code', 50)->unique()->comment('Unique GL code');
            $table->string('name', 100)->comment('Account name');
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->boolean('is_control_account')->default(false);
            $table->boolean('requires_subledger')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_leaf')->default(true);
            $table->foreignId('parent_id')->nullable()->constrained('ledger_accounts')->nullOnDelete();
            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Instrument Types
        |--------------------------------------------------------------------------
        */
        Schema::create('instrument_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->timestamps();
        });

        // Schema::create('cheque_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->string('cheque_no', 50);
        //     $table->date('cheque_date');

        //     $table->foreignId('bank_id')->constrained();
        //     $table->string('branch_name', 100)->nullable();

        //     $table->string('payee_name', 150)->nullable();
        //     $table->enum('status', ['issued', 'cleared', 'bounced'])
        //         ->default('issued');

        //     $table->timestamps();
        // });

        // Schema::create('bank_transfer_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->foreignId('bank_id')->constrained();
        //     $table->string('account_no', 50);

        //     $table->string('transaction_ref', 100)->unique();
        //     $table->date('transfer_date');

        //     $table->timestamps();
        // });

        // Schema::create('mobile_banking_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->string('provider', 50); // bKash, Nagad, etc
        //     $table->string('wallet_no', 30);

        //     $table->string('transaction_id', 100)->unique();
        //     $table->date('transaction_date');

        //     $table->timestamps();
        // });

        // Schema::create('card_instruments', function (Blueprint $table) {
        //     $table->id();

        //     $table->enum('card_type', ['DEBIT', 'CREDIT']);
        //     $table->string('card_last4', 4);

        //     $table->string('transaction_ref', 100)->unique();
        //     $table->date('transaction_date');

        //     $table->timestamps();
        // });


        /*
        |--------------------------------------------------------------------------
        | Ledger Account Balances
        |--------------------------------------------------------------------------
        */
        Schema::create('ledger_account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('ledger_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accounting_period_id')->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('voucher_lines');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('instrument_types');
        Schema::dropIfExists('cheque_instruments');
        Schema::dropIfExists('bank_transfer_instruments');
        Schema::dropIfExists('mobile_banking_instruments');
        Schema::dropIfExists('ledger_accounts');
        Schema::dropIfExists('accounting_periods');
        Schema::dropIfExists('fiscal_years');
    }
};