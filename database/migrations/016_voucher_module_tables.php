<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
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

        //     $table->string('voucher_id', 100)->unique();
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


        Schema::create('transaction_types', function (Blueprint $table) {
            $table->id();
            // 🔑 Unique key (used in code)
            $table->string('code')->unique(); // e.g. cash_deposit, loan_disbursement
            $table->string('name'); // 📝 Human readable
            // 🧠 Category (for grouping/reporting)
            $table->string('category'); // cash, loan, vendor, fee, system
            // ⚙️ Behavior Flags
            $table->boolean('is_cash')->default(false);
            $table->boolean('affects_balance')->default(true);
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_system')->default(false);
            // 🔁 Direction hint (optional)
            $table->enum('direction', ['inflow', 'outflow', 'both'])->default('both');
            // 🧩 Optional config
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        // -----------------------
        // Vouchers
        // -----------------------
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->constrained();
            $table->foreignId('fiscal_period_id')->constrained();
            $table->string('reference')->unique(); // 🔑 Unique Reference ex. deposit receipt
            // 🧠 Classification
            $table->foreignId('transaction_type_id')->constrained()->cascadeOnDelete();
            $table->enum('voucher_class', ['cash', 'bank', 'journal', 'contra', 'adjustment'])->default('journal');
            $table->enum('source_type', ['teller', 'online', 'system'])->default('system');
            $table->enum('channel', ['branch', 'mobile_app', 'internet_banking', 'atm', 'api'])->default('branch');
            // 🏦 Organization Context
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_day_id')->nullable()->constrained()->nullOnDelete();
            // 👤 Teller Session (nullable)
            $table->foreignId('teller_session_id')->nullable()->constrained()->nullOnDelete();
            // 🔗 Polymorphic Source (Deposit, Loan, Vendor, etc.)
            // $table->nullableMorphs('source_entity');
            // 🔁 Reversal Handling
            $table->foreignId('reversal_of')->nullable()->constrained('vouchers')->nullOnDelete();
            $table->boolean('is_reversed')->default(false);
            $table->boolean('is_adjustment')->default(false);
            // 💰 Optional (NOT accounting source of truth)
            $table->decimal('amount', 15, 2)->nullable();
            $table->text('description')->nullable();
            $table->date('transaction_date');     // business date

            $table->enum('status', ['draft', 'pending', 'approved', 'posted', 'reversed', 'cancelled'])->default('draft');
            $table->timestamps();

            // 🚀 Indexing
            $table->index(['branch_id', 'transaction_date']);
            $table->index(['transaction_type_id']);
            $table->index(['source_type']);
        });

        Schema::create('voucher_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
            $table->enum('action', ['created', 'updated', 'submitted', 'approved', 'rejected', 'posted', 'reversed', 'cancelled']);
            // 📊 State tracking
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            // 👤 Who did it
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            // 🌐 Context (VERY useful in real systems)
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            // 🧾 Change snapshot (JSON)
            $table->json('changes')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
            $table->index(['voucher_id']);
            $table->index(['action']);
        });

        // -----------------------
        // Voucher Entries
        // -----------------------
        Schema::create('voucher_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
            // 🧾 GL Account (still required)
            $table->foreignId('ledger_account_id')->constrained('ledger_accounts');
            // 🔥 POLYMORPHIC ACCOUNT (who owns this entry)
            $table->morphs('account');
            // account_type: DepositAccount / Loan / Vendor / Vault / Teller
            // account_id: respective ID

            // 🔗 Optional Reference (secondary link)
            $table->nullableMorphs('reference');
            // e.g. link to invoice, loan schedule, external payment, etc.

            // 💰 Debit / Credit
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);

            // 🏦 Context
            $table->foreignId('branch_id')->constrained();
            $table->date('transaction_date');

            // 📝 Narration
            $table->string('narration')->nullable();

            $table->timestamps();

            // 🚀 Indexing
            $table->index(['voucher_id']);
            $table->index(['ledger_account_id']);
            $table->index(['account_type', 'account_id'], 'txn_entries_account_type_idx');
        });

        /*
       |--------------------------------------------------------------------------
       | DROP EXISTING VIEWS (Safety)
       |--------------------------------------------------------------------------
       */
        DB::statement("DROP VIEW IF EXISTS view_shareholders_equity");
        DB::statement("DROP VIEW IF EXISTS view_cash_flow");
        DB::statement("DROP VIEW IF EXISTS view_balance_sheet");
        DB::statement("DROP VIEW IF EXISTS view_profit_and_loss");
        DB::statement("DROP VIEW IF EXISTS view_trial_balance");

        /*
        |--------------------------------------------------------------------------
        | Trial Balance View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_trial_balance AS
        SELECT
            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,
            a.type AS account_type,

            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            SUM(te.debit)  AS total_debit,
            SUM(te.credit) AS total_credit,

            CASE
                WHEN a.type IN ('asset','expense')
                    THEN SUM(te.debit) - SUM(te.credit)
                ELSE
                    SUM(te.credit) - SUM(te.debit)
            END AS balance

        FROM ledger_accounts a
        JOIN voucher_entries te ON te.ledger_account_id = a.id
        JOIN vouchers t ON t.id = te.voucher_id
            AND t.status = 'posted'
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE a.is_active = TRUE

        GROUP BY 
            a.id, a.code, a.name, a.type,
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name

        ORDER BY a.code;
        ");

        /*
        |--------------------------------------------------------------------------
        | Profit & Loss View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_profit_and_loss AS
        SELECT
            CASE
                WHEN a.type = 'income'  THEN 'income'
                WHEN a.type = 'expense' THEN 'expense'
            END AS category,

            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,

            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            COALESCE(SUM(
                CASE 
                    WHEN a.type = 'income' THEN te.credit - te.debit
                    WHEN a.type = 'expense' THEN te.debit - te.credit
                END
            ),0) AS amount

        FROM ledger_accounts a
        LEFT JOIN voucher_entries te ON te.ledger_account_id = a.id
        LEFT JOIN vouchers t ON t.id = te.voucher_id
            AND t.status = 'posted'
        LEFT JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        LEFT JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE a.type IN ('income','expense')
        AND a.is_active = TRUE
        AND a.is_control_account = FALSE

        GROUP BY 
            a.id, a.code, a.name, category,
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name

        ORDER BY a.code;
        ");

        /*
        |--------------------------------------------------------------------------
        | Balance Sheet View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_balance_sheet AS
        SELECT
            a.type AS category,
            a.id AS ledger_account_id,
            a.code AS account_code,
            a.name AS account_name,

            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            SUM(
                CASE
                    WHEN a.type = 'asset'
                        THEN te.debit - te.credit
                    ELSE
                        te.credit - te.debit
                END
            ) AS balance

        FROM ledger_accounts a
        JOIN voucher_entries te ON te.ledger_account_id = a.id
        JOIN vouchers t ON t.id = te.voucher_id
            AND t.status = 'posted'
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE a.type IN ('asset','liability','equity')
        AND a.is_active = TRUE

        GROUP BY 
            a.id, a.code, a.name, a.type,
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name

        ORDER BY a.code;
        ");

        /*
        |--------------------------------------------------------------------------
        | Cash Flow View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_cash_flow AS
        SELECT
            t.fiscal_year_id,
            fy.code AS fiscal_year_code,

            t.fiscal_period_id,
            ap.period_name,

            CASE
                WHEN tt.category = 'cash' THEN 'Operating'
                WHEN tt.category = 'loan' THEN 'Financing'
                WHEN tt.category = 'vendor' THEN 'Investing'
                ELSE 'Other'
            END AS cash_category,

            SUM(
                CASE 
                    WHEN la.type IN ('asset','expense') THEN te.debit - te.credit
                    ELSE te.credit - te.debit
                END
            ) AS net_cash

        FROM voucher_entries te
        JOIN vouchers t ON t.id = te.voucher_id
            AND t.status = 'posted'
        JOIN transaction_types tt ON tt.id = t.transaction_type_id
        JOIN ledger_accounts la ON la.id = te.ledger_account_id
        JOIN fiscal_years fy ON fy.id = t.fiscal_year_id
        JOIN fiscal_periods ap ON ap.id = t.fiscal_period_id

        WHERE la.is_active = TRUE
        AND tt.is_cash = TRUE

        GROUP BY 
            t.fiscal_year_id, fy.code,
            t.fiscal_period_id, ap.period_name,
            cash_category

        ORDER BY 
            t.fiscal_year_id,
            t.fiscal_period_id,
            cash_category;
        ");

        /*
        |--------------------------------------------------------------------------
        | Shareholders' Equity View
        |--------------------------------------------------------------------------
        */
        DB::statement("
        CREATE VIEW view_shareholders_equity AS
        WITH equity_accounts AS (
            SELECT id, code, name
            FROM ledger_accounts
            WHERE type = 'equity'
        ),
        net_profit AS (
            SELECT
                t.fiscal_year_id,
                t.fiscal_period_id,

                COALESCE(SUM(
                    CASE 
                        WHEN la.type = 'income' THEN te.credit - te.debit
                        WHEN la.type = 'expense' THEN te.debit - te.credit
                        ELSE 0
                    END
                ),0) AS net_profit

            FROM voucher_entries te
            JOIN vouchers t ON t.id = te.voucher_id
                AND t.status = 'posted'
            JOIN ledger_accounts la ON la.id = te.ledger_account_id

            WHERE la.type IN ('income','expense')

            GROUP BY t.fiscal_year_id, t.fiscal_period_id
        )
        SELECT
            eq.id AS ledger_account_id,
            eq.code AS account_code,
            eq.name AS account_name,

            np.fiscal_year_id,
            np.fiscal_period_id,
            np.net_profit

        FROM equity_accounts eq
        JOIN net_profit np ON 1=1

        ORDER BY eq.code;
        ");

    }


    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS view_shareholders_equity');
        DB::statement('DROP VIEW IF EXISTS view_cash_flow');
        DB::statement('DROP VIEW IF EXISTS view_balance_sheet');
        DB::statement('DROP VIEW IF EXISTS view_profit_and_loss');
        DB::statement('DROP VIEW IF EXISTS view_trial_balance');

        Schema::dropIfExists('voucher_entries');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('transaction_types');
    }
};